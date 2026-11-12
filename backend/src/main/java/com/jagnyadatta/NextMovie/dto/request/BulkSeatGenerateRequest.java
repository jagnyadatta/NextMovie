package com.jagnyadatta.NextMovie.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BulkSeatGenerateRequest {

    @NotNull(message = "Screen UUID is required")
    private UUID screenUuid;

    @NotNull(message = "Total rows is required")
    @Min(value = 1, message = "Must have at least 1 row")
    @Max(value = 26, message = "Maximum 26 rows allowed (A-Z)")
    private Integer totalRows;

    @NotNull(message = "Seats per row is required")
    @Min(value = 1, message = "Must have at least 1 seat per row")
    @Max(value = 50, message = "Maximum 50 seats per row allowed")
    private Integer seatsPerRow;

    /**
     * If true, clears any existing unreserved seats for this screen and regenerates fresh layout.
     * If false, generates missing seats idempotently without deleting or duplicating existing seats.
     */
    private Boolean replaceExisting = false;
}

