package com.jagnyadatta.NextMovie.controller;

import com.jagnyadatta.NextMovie.dto.request.TheatreRequest;
import com.jagnyadatta.NextMovie.dto.response.TheatreResponse;
import com.jagnyadatta.NextMovie.service.TheatreService;
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
@RequestMapping("/theatres")
@RequiredArgsConstructor
public class TheatreController {
    private final TheatreService theatreService;

    // =========================
    // PUBLIC
    // =========================

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TheatreResponse>>> getTheatres(
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<TheatreResponse> theatres = theatreService.getActiveTheatres(pageable);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Theatres fetched successfully",
                        theatres
                )
        );
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<Page<TheatreResponse>>> getByCity(
            @PathVariable String city,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<TheatreResponse> theatres = theatreService.getTheatresByCity(city, pageable);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Theatres fetched successfully",
                        theatres
                )
        );
    }

    @GetMapping("/{theatreUuid}")
    public ResponseEntity<ApiResponse<TheatreResponse>> getByUuid(
            @PathVariable UUID theatreUuid
    ) {
        TheatreResponse theatre = theatreService.getByUuid(theatreUuid);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Theatre fetched successfully",
                        theatre
                )
        );
    }

    // =========================
    // ADMIN
    // =========================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TheatreResponse>> create(
            @Valid @RequestBody TheatreRequest request
    ) {
        TheatreResponse theatre = theatreService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                HttpStatus.CREATED.value(),
                                "Theatre created successfully",
                                theatre
                        )
                );
    }

    @PutMapping("/{theatreUuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TheatreResponse>> update(
            @PathVariable UUID theatreUuid,
            @Valid @RequestBody TheatreRequest request
    ) {
        TheatreResponse theatre = theatreService.update(theatreUuid, request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Theatre updated successfully",
                        theatre
                )
        );
    }

    @PatchMapping("/{theatreUuid}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable UUID theatreUuid,
            @RequestParam boolean active
    ) {
        theatreService.updateStatus(theatreUuid, active);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Theatre status updated successfully",
                        null
                )
        );
    }

    @DeleteMapping("/{theatreUuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID theatreUuid
    ) {
        theatreService.delete(theatreUuid);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Theatre deleted successfully",
                        null
                )
        );
    }
}