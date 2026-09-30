package com.jagnyadatta.NextMovie.dto.request;

import com.jagnyadatta.NextMovie.enums.SeatType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeatRequest {
    @NotNull(message = "Screen UUID is required")
    private UUID screenUuid;

    @NotBlank(message = "Seat number is required")
    private String seatNumber;

    @NotBlank(message = "Row number is required")
    private String rowNumber;

    @NotNull(message = "Seat type is required")
    private SeatType seatType;
}