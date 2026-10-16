package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.dto.request.ShowSeatPriceRequest;
import com.jagnyadatta.NextMovie.dto.response.ShowSeatResponse;
import com.jagnyadatta.NextMovie.entity.ShowSeat;
import com.jagnyadatta.NextMovie.enums.ShowSeatStatus;
import com.jagnyadatta.NextMovie.exception.ResourceNotFoundException;
import com.jagnyadatta.NextMovie.repository.ShowSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ShowSeatService {
    private final ShowSeatRepository showSeatRepository;

    @Transactional(readOnly = true)
    public Page<ShowSeatResponse> getByShow(UUID showUuid, Pageable pageable) {

        return showSeatRepository
                .findByShow_ShowUuid(
                        showUuid,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ShowSeatResponse> getAvailableSeats(UUID showUuid, Pageable pageable) {
        return showSeatRepository
                .findByShow_ShowUuidAndStatus(
                        showUuid,
                        ShowSeatStatus.AVAILABLE,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ShowSeatResponse getByUuid(
            UUID showSeatUuid
    ) {

        return mapToResponse(
                findShowSeat(showSeatUuid)
        );
    }

    public ShowSeatResponse updatePrice(
            UUID showSeatUuid,
            ShowSeatPriceRequest request
    ) {
        ShowSeat showSeat = findShowSeat(showSeatUuid);

        if (showSeat.getStatus() == ShowSeatStatus.BOOKED) {
            throw new IllegalStateException(
                    "Cannot change price of a booked seat"
            );
        }

        showSeat.setPrice(request.getPrice());

        return mapToResponse(
                showSeatRepository.save(showSeat)
        );
    }

    public void updateStatus(UUID showSeatUuid, ShowSeatStatus status) {
        ShowSeat showSeat = findShowSeat(showSeatUuid);
        /*
         * In the future, booking logic should control
         * LOCKED and BOOKED states.
         */
        if (showSeat.getStatus() == ShowSeatStatus.BOOKED
                && status != ShowSeatStatus.BOOKED) {

            throw new IllegalStateException(
                    "A booked seat cannot be manually changed"
            );
        }

        showSeat.setStatus(status);

        if (status != ShowSeatStatus.LOCKED) {
            showSeat.setLockedAt(null);
        }

        showSeatRepository.save(showSeat);
    }

    private ShowSeat findShowSeat(UUID showSeatUuid) {
        return showSeatRepository
                .findByShowSeatUuid(showSeatUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Show seat not found with UUID: "
                                        + showSeatUuid
                        )
                );
    }

    private ShowSeatResponse mapToResponse(ShowSeat showSeat) {
        return new ShowSeatResponse(
                showSeat.getShowSeatUuid(),
                showSeat.getShow().getShowUuid(),
                showSeat.getSeat().getSeatUuid(),
                showSeat.getSeat().getSeatNumber(),
                showSeat.getSeat().getRowNumber(),
                showSeat.getSeat().getSeatType(),
                showSeat.getPrice(),
                showSeat.getStatus(),
                showSeat.getLockedAt(),
                showSeat.getCreatedAt(),
                showSeat.getUpdatedAt()
        );
    }
}