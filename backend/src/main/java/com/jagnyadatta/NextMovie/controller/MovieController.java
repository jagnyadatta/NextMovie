package com.jagnyadatta.NextMovie.controller;

import com.jagnyadatta.NextMovie.dto.request.MovieRequest;
import com.jagnyadatta.NextMovie.dto.response.ApiResponse;
import com.jagnyadatta.NextMovie.dto.response.MovieResponse;
import com.jagnyadatta.NextMovie.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/movies")
public class MovieController {
    private final MovieService movieService;

    // =========================================================
    // PUBLIC ENDPOINTS
    // =========================================================

    // Recently released movies
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<Page<MovieResponse>>> getRecentMovies(
            @PageableDefault(
                    size = 10,
                    sort = "released",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {
        Page<MovieResponse> movies = movieService.getRecentMovies(pageable);
        ApiResponse<Page<MovieResponse>> response =
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Recent movies fetched successfully",
                        movies
                );
        return ResponseEntity.ok(response);
    }

    // All movies
    @GetMapping
    public ResponseEntity<ApiResponse<Page<MovieResponse>>> getAllMovies(
            @PageableDefault(
                    size = 10,
                    sort = "title",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {
        Page<MovieResponse> movies = movieService.getAllMovies(pageable);
        ApiResponse<Page<MovieResponse>> response =
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Movies fetched successfully",
                        movies
                );

        return ResponseEntity.ok(response);
    }

    // Movies by language
    @GetMapping("/language/{language}")
    public ResponseEntity<ApiResponse<Page<MovieResponse>>> getMoviesByLanguage(
            @PathVariable String language,

            @PageableDefault(
                    size = 10,
                    sort = "released",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        Page<MovieResponse> movies =
                movieService.getMoviesByLanguage(
                        language,
                        pageable
                );

        ApiResponse<Page<MovieResponse>> response =
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Movies fetched successfully",
                        movies
                );

        return ResponseEntity.ok(response);
    }

    // Search movie by name/title
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<MovieResponse>>> searchMovies(
            @RequestParam String title,
            @PageableDefault(
                    size = 10,
                    sort = "title",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<MovieResponse> movies =
                movieService.searchMovies(
                        title,
                        pageable
                );

        ApiResponse<Page<MovieResponse>> response =
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Movies search completed successfully",
                        movies
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // ADMIN ENDPOINTS
    // =========================================================

    // Get movie by UUID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{movieUuid}")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovieByUuid(
            @PathVariable UUID movieUuid) {
        MovieResponse movie = movieService.getByUuid(movieUuid);
        ApiResponse<MovieResponse> response =
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Movie fetched successfully",
                        movie
                );
        return ResponseEntity.ok(response);
    }

    // Create movie
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<MovieResponse>> createMovie(
            @Valid @RequestBody MovieRequest request) {
        MovieResponse movie = movieService.create(request);
        ApiResponse<MovieResponse> response =
                ApiResponse.success(
                        HttpStatus.CREATED.value(),
                        "Movie created successfully",
                        movie
                );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    //Add movie by imdbId
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/import/{imdbId}")
    public ResponseEntity<ApiResponse<MovieResponse>> importMovieFromOmdb(
            @PathVariable String imdbId) {
        MovieResponse movie = movieService.importMovieFromOmdb(imdbId);
        ApiResponse<MovieResponse> response =
                ApiResponse.success(
                        HttpStatus.CREATED.value(),
                        "Movie imported from OMDb successfully",
                        movie
                );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Update movie
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{movieUuid}")
    public ResponseEntity<ApiResponse<MovieResponse>> updateMovie(
            @PathVariable UUID movieUuid,
            @Valid @RequestBody MovieRequest request) {
        MovieResponse movie = movieService.update(movieUuid, request);
        ApiResponse<MovieResponse> response =
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Movie updated successfully",
                        movie
                );

        return ResponseEntity.ok(response);
    }

    // Delete movie
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{movieUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable UUID movieUuid) {
        movieService.delete(movieUuid);
        ApiResponse<Void> response =
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Movie deleted successfully",
                        null
                );
        return ResponseEntity.ok(response);
    }
}