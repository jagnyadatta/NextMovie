package com.jagnyadatta.NextMovie.dto.request;

import com.jagnyadatta.NextMovie.enums.ShowStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowRequest {
    @NotNull(message = "Movie UUID is required")
    private UUID movieUuid;

    @NotNull(message = "Screen UUID is required")
    private UUID screenUuid;

    @NotNull(message = "Show date is required")
    @FutureOrPresent(message = "Show date cannot be in the past")
    private LocalDate showDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private ShowStatus status;

    /*
     * Example:
     *
     * REGULAR  -> 180
     * PREMIUM  -> 250
     * RECLINER -> 400
     * VIP      -> 500
     */
    private Map<String, Double> seatPrices;
}