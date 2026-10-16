package com.jagnyadatta.NextMovie.dto.response;

import com.jagnyadatta.NextMovie.enums.SeatType;
import com.jagnyadatta.NextMovie.enums.ShowSeatStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowSeatResponse {
    private UUID showSeatUuid;

    private UUID showUuid;

    private UUID seatUuid;
    private String seatNumber;
    private String rowNumber;
    private SeatType seatType;

    private Double price;

    private ShowSeatStatus status;

    private LocalDateTime lockedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}