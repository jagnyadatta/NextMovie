package com.jagnyadatta.NextMovie.controller;

import com.jagnyadatta.NextMovie.dto.request.ShowSeatPriceRequest;
import com.jagnyadatta.NextMovie.dto.response.ShowSeatResponse;
import com.jagnyadatta.NextMovie.enums.ShowSeatStatus;
import com.jagnyadatta.NextMovie.service.ShowSeatService;
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
@RequestMapping("/show-seats")
@RequiredArgsConstructor
public class ShowSeatController {
    private final ShowSeatService showSeatService;
    // =========================
    // PUBLIC
    // =========================

    @GetMapping("/show/{showUuid}")
    public ResponseEntity<ApiResponse<Page<ShowSeatResponse>>> getByShow(
            @PathVariable UUID showUuid,
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Show seats fetched successfully",
                        showSeatService.getByShow(
                                showUuid,
                                pageable
                        )
                )
        );
    }

    @GetMapping("/show/{showUuid}/available")
    public ResponseEntity<ApiResponse<Page<ShowSeatResponse>>> getAvailableSeats(
            @PathVariable UUID showUuid,
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Available show seats fetched successfully",
                        showSeatService.getAvailableSeats(
                                showUuid,
                                pageable
                        )
                )
        );
    }

    @GetMapping("/{showSeatUuid}")
    public ResponseEntity<ApiResponse<ShowSeatResponse>> getByUuid(
            @PathVariable UUID showSeatUuid
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Show seat fetched successfully",
                        showSeatService.getByUuid(
                                showSeatUuid
                        )
                )
        );
    }

    // =========================
    // ADMIN
    // =========================
    @PutMapping("/{showSeatUuid}/price")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShowSeatResponse>> updatePrice(
            @PathVariable UUID showSeatUuid,
            @Valid @RequestBody ShowSeatPriceRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Show seat price updated successfully",
                        showSeatService.updatePrice(
                                showSeatUuid,
                                request
                        )
                )
        );
    }

    @PatchMapping("/{showSeatUuid}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable UUID showSeatUuid,
            @RequestParam ShowSeatStatus status
    ) {
        showSeatService.updateStatus(showSeatUuid, status);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Show seat status updated successfully",
                        null
                )
        );
    }
}