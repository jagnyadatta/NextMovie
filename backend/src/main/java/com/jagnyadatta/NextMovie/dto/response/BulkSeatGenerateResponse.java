package com.jagnyadatta.NextMovie.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BulkSeatGenerateResponse {
    private Integer totalSeatsCreated;
    private Integer totalSeatsExisting;
    private Integer totalSeatsConfigured;
    private Integer screenCapacity;
    private List<SeatResponse> seats;
}

