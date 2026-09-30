package com.jagnyadatta.NextMovie.controller;

import com.jagnyadatta.NextMovie.dto.request.SeatRequest;
import com.jagnyadatta.NextMovie.dto.response.SeatResponse;
import com.jagnyadatta.NextMovie.service.SeatService;
import com.jagnyadatta.NextMovie.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
public class SeatController {
    private final SeatService seatService;

    // PUBLIC
    @GetMapping("/screen/{screenUuid}")
    public ResponseEntity<ApiResponse<Page<SeatResponse>>> getSeatsByScreen(
            @PathVariable UUID screenUuid,
            @PageableDefault Pageable pageable
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Seats fetched successfully",
                        seatService.getSeatsByScreen(screenUuid, pageable)
                )
        );
    }

    @GetMapping("/byid/{seatUuid}")
    public ResponseEntity<ApiResponse<SeatResponse>> getByUuid(
            @PathVariable UUID seatUuid
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Seat fetched successfully",
                        seatService.getByUuid(seatUuid)
                )
        );
    }

    // ADMIN

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SeatResponse>> create(
            @Valid @RequestBody SeatRequest request
    ) {
        SeatResponse response = seatService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                HttpStatus.CREATED.value(),
                                "Seat created successfully",
                                response
                        )
                );
    }

    @PutMapping("/{seatUuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SeatResponse>> update(
            @PathVariable UUID seatUuid,
            @Valid @RequestBody SeatRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Seat updated successfully",
                        seatService.update(
                                seatUuid,
                                request
                        )
                )
        );
    }

    @PatchMapping("/{seatUuid}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable UUID seatUuid,
            @RequestParam boolean active
    ) {
        seatService.updateStatus(seatUuid, active);

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Seat status updated successfully",
                        null
                )
        );
    }

    @DeleteMapping("/{seatUuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID seatUuid) {
        seatService.delete(seatUuid);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Seat deleted successfully",
                        null
                )
        );
    }
}