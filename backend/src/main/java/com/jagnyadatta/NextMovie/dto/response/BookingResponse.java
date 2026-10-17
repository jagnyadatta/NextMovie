package com.jagnyadatta.NextMovie.dto.response;

import com.jagnyadatta.NextMovie.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {
    private UUID bookingUuid;
    private UUID showUuid;
    private UUID userUuid;

    private String movieTitle;
    private String theatreName;
    private String screenName;

    private Integer totalSeats;
    private Double totalAmount;
    private BookingStatus status;

    private List<BookingSeatResponse> seats;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}