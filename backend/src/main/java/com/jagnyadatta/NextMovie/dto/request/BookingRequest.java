package com.jagnyadatta.NextMovie.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequest {
    @NotNull(message = "Show UUID is required")
    private UUID showUuid;

    @NotEmpty(message = "Select at least one seat")
    private List<UUID> showSeatUuids;
}