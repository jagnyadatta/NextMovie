package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.dto.request.BulkSeatGenerateRequest;
import com.jagnyadatta.NextMovie.dto.request.SeatRequest;
import com.jagnyadatta.NextMovie.dto.response.BulkSeatGenerateResponse;
import com.jagnyadatta.NextMovie.dto.response.SeatResponse;
import com.jagnyadatta.NextMovie.entity.Screen;
import com.jagnyadatta.NextMovie.entity.Seat;
import com.jagnyadatta.NextMovie.enums.SeatType;
import com.jagnyadatta.NextMovie.exception.ResourceNotFoundException;
import com.jagnyadatta.NextMovie.repository.ScreenRepository;
import com.jagnyadatta.NextMovie.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

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
        String normalizedRow = request.getRowNumber().trim().toUpperCase();
        String normalizedSeat = request.getSeatNumber().trim();

        if (seatRepository.existsByScreen_ScreenUuidAndRowNumberAndSeatNumber(
                request.getScreenUuid(),
                normalizedRow,
                normalizedSeat
        )) {
            throw new IllegalStateException(
                    "Seat already exists in this screen with row " + normalizedRow + " and seat " + normalizedSeat
            );
        }

        Seat seat = new Seat();
        seat.setScreen(screen);
        seat.setSeatNumber(normalizedSeat);
        seat.setRowNumber(normalizedRow);
        seat.setSeatType(request.getSeatType());
        seat.setActive(true);

        Seat savedSeat = seatRepository.save(seat);
        return mapToResponse(savedSeat);
    }

    /**
     * Dedicated bulk seat generation API:
     * - Validates seat configuration against screen capacity.
     * - Generates unique seat numbers and row letters (A-Z).
     * - Runs in an atomic transaction; rolls back completely on any validation or constraint error.
     * - Idempotent: Skips already existing seats rather than creating duplicates or throwing 409.
     */
    public BulkSeatGenerateResponse bulkGenerateSeats(BulkSeatGenerateRequest request) {
        Screen screen = findScreen(request.getScreenUuid());
        int totalRows = request.getTotalRows();
        int seatsPerRow = request.getSeatsPerRow();
        int requestedCapacity = totalRows * seatsPerRow;

        if (screen.getTotalSeats() != null && requestedCapacity > screen.getTotalSeats()) {
            throw new IllegalArgumentException(
                    "Requested layout (" + requestedCapacity + " seats) exceeds screen capacity of "
                            + screen.getTotalSeats() + " seats."
            );
        }

        List<Seat> existingSeats = seatRepository.findByScreen_ScreenUuid(request.getScreenUuid());

        if (Boolean.TRUE.equals(request.getReplaceExisting()) && !existingSeats.isEmpty()) {
            seatRepository.deleteAll(existingSeats);
            seatRepository.flush();
            existingSeats = Collections.emptyList();
        }

        Set<String> existingKeys = existingSeats.stream()
                .map(s -> s.getRowNumber().trim().toUpperCase() + "-" + s.getSeatNumber().trim())
                .collect(Collectors.toSet());

        List<Seat> seatsToSave = new ArrayList<>();
        for (int r = 0; r < totalRows; r++) {
            char rowChar = (char) ('A' + r);
            String rowStr = String.valueOf(rowChar);

            // Row A is VIP, Rows B-C are PREMIUM, remaining rows are REGULAR
            SeatType seatType;
            if (r == 0) {
                seatType = SeatType.VIP;
            } else if (r <= 2) {
                seatType = SeatType.PREMIUM;
            } else {
                seatType = SeatType.REGULAR;
            }

            for (int s = 1; s <= seatsPerRow; s++) {
                String seatNumStr = String.valueOf(s);
                String key = rowStr + "-" + seatNumStr;

                if (!existingKeys.contains(key)) {
                    Seat seat = new Seat();
                    seat.setScreen(screen);
                    seat.setRowNumber(rowStr);
                    seat.setSeatNumber(seatNumStr);
                    seat.setSeatType(seatType);
                    seat.setActive(true);
                    seatsToSave.add(seat);
                    existingKeys.add(key);
                }
            }
        }

        int finalTotal = existingSeats.size() + seatsToSave.size();
        if (screen.getTotalSeats() != null && finalTotal > screen.getTotalSeats()) {
            throw new IllegalStateException(
                    "Adding " + seatsToSave.size() + " new seats would exceed screen capacity ("
                            + screen.getTotalSeats() + "). Existing seats: " + existingSeats.size()
            );
        }

        if (!seatsToSave.isEmpty()) {
            seatRepository.saveAll(seatsToSave);
        }

        List<Seat> allSeats = seatRepository.findByScreen_ScreenUuid(request.getScreenUuid());

        return new BulkSeatGenerateResponse(
                seatsToSave.size(),
                existingSeats.size(),
                allSeats.size(),
                screen.getTotalSeats(),
                allSeats.stream().map(this::mapToResponse).toList()
        );
    }

    public SeatResponse update(UUID seatUuid, SeatRequest request) {
        Seat seat = findSeat(seatUuid);

        Screen screen = findScreen(request.getScreenUuid());
        seat.setScreen(screen);
        seat.setSeatNumber(request.getSeatNumber().trim());
        seat.setRowNumber(request.getRowNumber().trim().toUpperCase());
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
        seatRepository.delete(seat);
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