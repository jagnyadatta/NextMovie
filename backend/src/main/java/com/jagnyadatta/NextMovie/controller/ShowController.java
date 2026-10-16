package com.jagnyadatta.NextMovie.controller;

import com.jagnyadatta.NextMovie.dto.request.ShowRequest;
import com.jagnyadatta.NextMovie.dto.response.ShowResponse;
import com.jagnyadatta.NextMovie.dto.response.ShowSeatResponse;
import com.jagnyadatta.NextMovie.enums.ShowStatus;
import com.jagnyadatta.NextMovie.service.ShowSeatService;
import com.jagnyadatta.NextMovie.service.ShowService;
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

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/shows")
@RequiredArgsConstructor
public class ShowController {
    private final ShowService showService;
    private final ShowSeatService showSeatService;

    // =========================
    // PUBLIC
    // =========================
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ShowResponse>>> getShows(
            @RequestParam(required = false)
            LocalDate date,

            @PageableDefault(size = 10)
            Pageable pageable
    ) {
        if (date == null) {
            date = LocalDate.now();
        }
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Shows fetched successfully",
                        showService.getShows(
                                date,
                                pageable
                        )
                )
        );
    }

    @GetMapping("/movie/{movieUuid}")
    public ResponseEntity<ApiResponse<Page<ShowResponse>>> getByMovie(
            @PathVariable UUID movieUuid,

            @RequestParam(required = false)
            LocalDate date,

            @PageableDefault(size = 10)
            Pageable pageable
    ) {
        if (date == null) {
            date = LocalDate.now();
        }
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Movie shows fetched successfully",
                        showService.getShowsByMovie(
                                movieUuid,
                                date,
                                pageable
                        )
                )
        );
    }

    @GetMapping("/theatre/{theatreUuid}")
    public ResponseEntity<ApiResponse<Page<ShowResponse>>> getByTheatre(
            @PathVariable UUID theatreUuid,

            @RequestParam(required = false)
            LocalDate date,

            @PageableDefault(size = 10)
            Pageable pageable
    ) {
        if (date == null) {
            date = LocalDate.now();
        }
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Theatre shows fetched successfully",
                        showService.getShowsByTheatre(
                                theatreUuid,
                                date,
                                pageable
                        )
                )
        );
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<Page<ShowResponse>>> getByCity(
            @PathVariable String city,

            @RequestParam(required = false)
            LocalDate date,

            @PageableDefault(size = 10)
            Pageable pageable
    ) {
        if (date == null) {
            date = LocalDate.now();
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "City shows fetched successfully",
                        showService.getShowsByCity(
                                city,
                                date,
                                pageable
                        )
                )
        );
    }

    @GetMapping("/{showUuid}")
    public ResponseEntity<ApiResponse<ShowResponse>> getByUuid(
            @PathVariable UUID showUuid
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Show fetched successfully",
                        showService.getByUuid(showUuid)
                )
        );
    }

    @GetMapping("/{showUuid}/seats")
    public ResponseEntity<ApiResponse<Page<ShowSeatResponse>>> getShowSeats(
            @PathVariable UUID showUuid,
            @PageableDefault(size = 100) Pageable pageable
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

    @GetMapping("/{showUuid}/available-seats")
    public ResponseEntity<ApiResponse<Page<ShowSeatResponse>>> getAvailableSeats(
            @PathVariable UUID showUuid,
            @PageableDefault(size = 100) Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Available seats fetched successfully",
                        showSeatService.getAvailableSeats(
                                showUuid,
                                pageable
                        )
                )
        );
    }

    // =========================
    // ADMIN
    // =========================
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShowResponse>> create(
            @Valid @RequestBody ShowRequest request
    ) {
        ShowResponse response = showService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                HttpStatus.CREATED.value(),
                                "Show created successfully",
                                response
                        )
                );
    }

    @PutMapping("/{showUuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShowResponse>> update(
            @PathVariable UUID showUuid,
            @Valid @RequestBody ShowRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Show updated successfully",
                        showService.update(
                                showUuid,
                                request
                        )
                )
        );
    }

    @PatchMapping("/{showUuid}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable UUID showUuid,
            @RequestParam ShowStatus status
    ) {
        showService.updateStatus(showUuid, status);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Show status updated successfully",
                        null
                )
        );
    }

    @DeleteMapping("/{showUuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID showUuid
    ) {
        showService.delete(showUuid);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Show deleted successfully",
                        null
                )
        );
    }
}