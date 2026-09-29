package com.jagnyadatta.NextMovie.dto.request;

import com.jagnyadatta.NextMovie.enums.ScreenType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScreenRequest {
    @NotBlank(message = "Screen name is required")
    private String name;

    @NotNull(message = "Theatre UUID is required")
    private UUID theatreUuid;

    @NotNull(message = "Total seats is required")
    @Positive(message = "Total seats must be greater than zero")
    private Integer totalSeats;

    @NotNull(message = "Screen type is required")
    private ScreenType screenType;
}