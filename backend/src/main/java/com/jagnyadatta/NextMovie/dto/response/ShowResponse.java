package com.jagnyadatta.NextMovie.dto.response;

import com.jagnyadatta.NextMovie.enums.ShowStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowResponse {
    private UUID showUuid;

    private UUID movieUuid;
    private String movieTitle;

    private UUID screenUuid;
    private String screenName;

    private UUID theatreUuid;
    private String theatreName;

    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private ShowStatus status;
    private Boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}