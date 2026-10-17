package com.jagnyadatta.NextMovie.controller;

import com.jagnyadatta.NextMovie.dto.request.BookingRequest;
import com.jagnyadatta.NextMovie.dto.response.BookingResponse;
import com.jagnyadatta.NextMovie.service.BookingService;
import com.jagnyadatta.NextMovie.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // USER: create a booking for the authenticated user

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication
    ) {
        BookingResponse booking = bookingService.createBooking(
                authentication.getName(),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                HttpStatus.CREATED.value(),
                                "Booking created and seats locked successfully",
                                booking
                        )
                );
    }

    // USER: view their own bookings

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getMyBookings(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<BookingResponse> bookings =
                bookingService.getMyBookings(
                        authentication.getName(),
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Your bookings fetched successfully",
                        bookings
                )
        );
    }

    // USER: view one of their own bookings

    @GetMapping("/{bookingUuid}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> getMyBooking(
            @PathVariable UUID bookingUuid,
            Authentication authentication
    ) {
        BookingResponse booking = bookingService.getMyBooking(
                authentication.getName(),
                bookingUuid
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Booking fetched successfully",
                        booking
                )
        );
    }

    // ADMIN: view all bookings

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<BookingResponse> bookings =
                bookingService.getAllBookings(pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "All bookings fetched successfully",
                        bookings
                )
        );
    }
}