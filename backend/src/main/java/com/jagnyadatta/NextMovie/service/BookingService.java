package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.dto.request.BookingRequest;
import com.jagnyadatta.NextMovie.dto.response.BookingResponse;
import com.jagnyadatta.NextMovie.dto.response.BookingSeatResponse;
import com.jagnyadatta.NextMovie.entity.*;
import com.jagnyadatta.NextMovie.enums.BookingStatus;
import com.jagnyadatta.NextMovie.enums.ShowSeatStatus;
import com.jagnyadatta.NextMovie.exception.ResourceNotFoundException;
import com.jagnyadatta.NextMovie.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowSeatRepository showSeatRepository;
    private final ShowRepository showRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(
            String email,
            BookingRequest request
    ) {
        // 1. Validate request
        List<UUID> requestedSeatUuids = request.getShowSeatUuids();

        if (requestedSeatUuids == null
                || requestedSeatUuids.isEmpty()) {
            throw new IllegalArgumentException(
                    "Select at least one seat"
            );
        }

        if (new HashSet<>(requestedSeatUuids).size()
                != requestedSeatUuids.size()) {
            throw new IllegalArgumentException(
                    "Duplicate seat UUIDs are not allowed"
            );
        }

        // 2. Find the authenticated user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user not found"
                        )
                );

        // 3. Validate show
        Show show = showRepository
                .findByShowUuid(request.getShowUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Show not found: "
                                        + request.getShowUuid()
                        )
                );

        if (!Boolean.TRUE.equals(show.getActive())
                || show.getStatus() == null
                || show.getStatus().name().equals("CANCELLED")) {
            throw new IllegalStateException(
                    "This show is not available for booking"
            );
        }

        // 4. Lock the requested seats in the database
        List<ShowSeat> showSeats =
                showSeatRepository.findAllByUuidInForUpdate(
                        requestedSeatUuids
                );

        if (showSeats.size() != requestedSeatUuids.size()) {
            throw new ResourceNotFoundException(
                    "One or more selected show seats do not exist"
            );
        }

        // 5. Validate every seat before making changes
        for (ShowSeat showSeat : showSeats) {

            if (!showSeat.getShow().getShowUuid()
                    .equals(show.getShowUuid())) {
                throw new IllegalArgumentException(
                        "A selected seat does not belong to this show"
                );
            }

            if (showSeat.getStatus() != ShowSeatStatus.AVAILABLE) {
                throw new IllegalStateException(
                        "Seat "
                                + showSeat.getSeat().getSeatNumber()
                                + " is no longer available"
                );
            }

            if (showSeat.getPrice() == null
                    || !Double.isFinite(showSeat.getPrice())
                    || showSeat.getPrice() <= 0) {
                throw new IllegalStateException(
                        "Invalid price configured for seat "
                                + showSeat.getSeat().getSeatNumber()
                );
            }
        }

        // 6. Calculate the total from trusted database prices.
        // BigDecimal is used internally for calculation, while
        // the existing entity fields remain Double.
        BigDecimal total = BigDecimal.ZERO;

        for (ShowSeat showSeat : showSeats) {
            total = total.add(
                    BigDecimal.valueOf(showSeat.getPrice())
            );
        }

        // 7. Create the booking first to generate its UUID
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShow(show);
        booking.setTotalSeats(showSeats.size());
        booking.setTotalAmount(total.doubleValue());
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.saveAndFlush(booking);

        // 8. Lock seats and create booking-seat associations
        List<BookingSeat> bookingSeats = new ArrayList<>();

        for (ShowSeat showSeat : showSeats) {

            showSeat.setStatus(ShowSeatStatus.LOCKED);
            showSeat.setLockedByBookingUuid(
                    savedBooking.getBookingUuid()
            );
            showSeat.setLockedAt(
                    java.time.LocalDateTime.now()
            );

            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(savedBooking);
            bookingSeat.setShowSeat(showSeat);
            bookingSeat.setPrice(showSeat.getPrice());

            bookingSeats.add(bookingSeat);
        }

        showSeatRepository.saveAll(showSeats);
        bookingSeatRepository.saveAll(bookingSeats);

        // 9. Return the completed response
        return mapToResponse(savedBooking, bookingSeats);
    }

    @Transactional(readOnly = true)
    public BookingResponse getMyBooking(
            String email,
            UUID bookingUuid
    ) {
        Booking booking = bookingRepository
                .findByBookingUuidAndUser_EmailIgnoreCase(
                        bookingUuid,
                        email
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        )
                );

        List<BookingSeat> seats =
                bookingSeatRepository.findByBooking_BookingUuid(
                        bookingUuid
                );

        return mapToResponse(booking, seats);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyBookings(
            String email,
            Pageable pageable
    ) {
        return bookingRepository
                .findByUser_EmailIgnoreCaseOrderByCreatedAtDesc(
                        email,
                        pageable
                )
                .map(booking -> {
                    List<BookingSeat> seats =
                            bookingSeatRepository
                                    .findByBooking_BookingUuid(
                                            booking.getBookingUuid()
                                    );

                    return mapToResponse(booking, seats);
                });
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookings(
            Pageable pageable
    ) {
        return bookingRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(booking -> {
                    List<BookingSeat> seats =
                            bookingSeatRepository
                                    .findByBooking_BookingUuid(
                                            booking.getBookingUuid()
                                    );

                    return mapToResponse(booking, seats);
                });
    }

    private BookingResponse mapToResponse(
            Booking booking,
            List<BookingSeat> bookingSeats
    ) {
        List<BookingSeatResponse> seatResponses =
                bookingSeats.stream()
                        .map(bookingSeat -> {
                            Seat seat = bookingSeat
                                    .getShowSeat()
                                    .getSeat();

                            return new BookingSeatResponse(
                                    bookingSeat.getBookingSeatUuid(),
                                    bookingSeat.getShowSeat()
                                            .getShowSeatUuid(),
                                    seat.getSeatUuid(),
                                    seat.getSeatNumber(),
                                    seat.getRowNumber(),
                                    bookingSeat.getPrice()
                            );
                        })
                        .toList();

        return new BookingResponse(
                booking.getBookingUuid(),
                booking.getShow().getShowUuid(),
                booking.getUser().getUserUuid(),
                booking.getShow().getMovie().getTitle(),
                booking.getShow().getScreen().getTheatre().getName(),
                booking.getShow().getScreen().getName(),
                booking.getTotalSeats(),
                booking.getTotalAmount(),
                booking.getStatus(),
                seatResponses,
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}