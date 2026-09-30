package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.dto.request.SeatRequest;
import com.jagnyadatta.NextMovie.dto.response.SeatResponse;
import com.jagnyadatta.NextMovie.entity.Screen;
import com.jagnyadatta.NextMovie.entity.Seat;
import com.jagnyadatta.NextMovie.exception.ResourceNotFoundException;
import com.jagnyadatta.NextMovie.repository.ScreenRepository;
import com.jagnyadatta.NextMovie.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SeatService {
    private final SeatRepository seatRepository;
    private final ScreenRepository screenRepository;

    @Transactional(readOnly = true)
    public Page<SeatResponse> getSeatsByScreen(
            UUID screenUuid,
            Pageable pageable
    ) {
        return seatRepository
                .findByScreen_ScreenUuidAndActiveTrue(
                        screenUuid,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public SeatResponse getByUuid(UUID seatUuid) {
        return mapToResponse(findSeat(seatUuid));
    }

    public SeatResponse create(SeatRequest request) {
        Screen screen = findScreen(request.getScreenUuid());

        if (seatRepository.existsByScreen_ScreenUuidAndSeatNumber(
                request.getScreenUuid(),
                request.getSeatNumber()
        )) {

            throw new IllegalStateException(
                    "Seat already exists in this screen"
            );
        }

        Seat seat = new Seat();

        seat.setScreen(screen);
        seat.setSeatNumber(request.getSeatNumber());
        seat.setRowNumber(request.getRowNumber());
        seat.setSeatType(request.getSeatType());

        Seat savedSeat = seatRepository.save(seat);

        // Keep Screen.totalSeats synchronized.
        screen.setTotalSeats(
                (screen.getTotalSeats() == null
                        ? 0
                        : screen.getTotalSeats()) + 1
        );
        screenRepository.save(screen);
        return mapToResponse(savedSeat);
    }

    public SeatResponse update(UUID seatUuid, SeatRequest request) {
        Seat seat = findSeat(seatUuid);

        Screen screen = findScreen(request.getScreenUuid());
        seat.setScreen(screen);
        seat.setSeatNumber(request.getSeatNumber());
        seat.setRowNumber(request.getRowNumber());
        seat.setSeatType(request.getSeatType());

        return mapToResponse(seatRepository.save(seat));
    }

    public void updateStatus(UUID seatUuid, boolean active) {
        Seat seat = findSeat(seatUuid);
        seat.setActive(active);
        seatRepository.save(seat);
    }

    public void delete(UUID seatUuid) {
        Seat seat = findSeat(seatUuid);
        Screen screen = seat.getScreen();
        seatRepository.delete(seat);
        if (screen.getTotalSeats() != null
                && screen.getTotalSeats() > 0) {
            screen.setTotalSeats(
                    screen.getTotalSeats() - 1
            );
            screenRepository.save(screen);
        }
    }

    private Seat findSeat(UUID seatUuid) {

        return seatRepository
                .findBySeatUuid(seatUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Seat not found with UUID: "
                                        + seatUuid
                        )
                );
    }

    private Screen findScreen(UUID screenUuid) {
        return screenRepository
                .findByScreenUuid(screenUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Screen not found with UUID: "
                                        + screenUuid
                        )
                );
    }

    private SeatResponse mapToResponse(Seat seat) {
        return new SeatResponse(
                seat.getSeatUuid(),
                seat.getScreen().getScreenUuid(),
                seat.getScreen().getName(),
                seat.getSeatNumber(),
                seat.getRowNumber(),
                seat.getSeatType(),
                seat.getActive(),
                seat.getCreatedAt(),
                seat.getUpdatedAt()
        );
    }
}