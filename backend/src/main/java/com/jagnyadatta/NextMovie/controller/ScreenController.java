package com.jagnyadatta.NextMovie.controller;

import com.jagnyadatta.NextMovie.dto.request.ScreenRequest;
import com.jagnyadatta.NextMovie.dto.response.ScreenResponse;
import com.jagnyadatta.NextMovie.service.ScreenService;
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
@RequestMapping("/screens")
@RequiredArgsConstructor
public class ScreenController {
    private final ScreenService screenService;

    // PUBLIC
    @GetMapping("/theatre/{theatreUuid}")
    public ResponseEntity<ApiResponse<Page<ScreenResponse>>> getByTheatreUuid(
            @PathVariable UUID theatreUuid,
            @PageableDefault(size = 10) Pageable pageable
    ){
        Page<ScreenResponse> screens = screenService.getScreensByTheatre(theatreUuid, pageable);
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Successfully retrieved screens",
                        screens
                )
        );
    }

    @GetMapping("/byid/{screenUuid}")
    public ResponseEntity<ApiResponse<ScreenResponse>> getByUuid(
            @PathVariable UUID screenUuid
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Screen fetched successfully",
                        screenService.getByUuid(screenUuid)
                )
        );
    }

    // ADMIN
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ScreenResponse>> create(
            @Valid @RequestBody ScreenRequest request
    ) {
        ScreenResponse response = screenService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                HttpStatus.CREATED.value(),
                                "Screen created successfully",
                                response
                        )
                );
    }

    @PutMapping("/{screenUuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ScreenResponse>> update(
            @PathVariable UUID screenUuid,
            @Valid @RequestBody ScreenRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Screen updated successfully",
                        screenService.update(
                                screenUuid,
                                request
                        )
                )
        );
    }

    @PatchMapping("/{screenUuid}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable UUID screenUuid,
            @RequestParam boolean active
    ) {

        screenService.updateStatus(
                screenUuid,
                active
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Screen status updated successfully",
                        null
                )
        );
    }

    @DeleteMapping("/{screenUuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID screenUuid
    ) {

        screenService.delete(screenUuid);

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Screen deleted successfully",
                        null
                )
        );
    }
}