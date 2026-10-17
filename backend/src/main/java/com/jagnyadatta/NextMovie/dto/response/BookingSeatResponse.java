package com.jagnyadatta.NextMovie.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingSeatResponse {
    private UUID bookingSeatUuid;
    private UUID showSeatUuid;
    private UUID seatUuid;
    private String seatNumber;
    private String rowNumber;
    private Double price;
}