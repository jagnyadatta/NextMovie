package com.jagnyadatta.NextMovie.dto.response;

import com.jagnyadatta.NextMovie.enums.SeatType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeatResponse {
    private UUID seatUuid;

    private UUID screenUuid;
    private String screenName;

    private String seatNumber;
    private String rowNumber;
    private SeatType seatType;

    private Boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}