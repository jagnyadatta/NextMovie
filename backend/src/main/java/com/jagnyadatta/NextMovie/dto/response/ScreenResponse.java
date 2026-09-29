package com.jagnyadatta.NextMovie.dto.response;

import com.jagnyadatta.NextMovie.enums.ScreenType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScreenResponse {

    private UUID screenUuid;
    private String name;

    private UUID theatreUuid;
    private String theatreName;

    private Integer totalSeats;
    private ScreenType screenType;

    private Boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}