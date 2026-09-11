package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.dto.external.OmdbMovieResponse;
import com.jagnyadatta.NextMovie.dto.request.MovieRequest;
import com.jagnyadatta.NextMovie.dto.response.MovieResponse;
import com.jagnyadatta.NextMovie.entity.Movie;
import com.jagnyadatta.NextMovie.entity.MovieRating;
import com.jagnyadatta.NextMovie.exception.ResourceNotFoundException;
import com.jagnyadatta.NextMovie.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MovieService {
    private final MovieRepository movieRepository;
    private final OmdbService omdbService;

    private static final DateTimeFormatter OMDB_DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM uuuu");

    // =========================================================
    // PUBLIC FUNCTIONS
    // =========================================================

    // Get recently released movies
    @Transactional(readOnly = true)
    public Page<MovieResponse> getRecentMovies(Pageable pageable) {
        return movieRepository
                .findAllByOrderByReleasedDesc(pageable)
                .map(this::mapToResponse);
    }

    // Get all movies
    @Transactional(readOnly = true)
    public Page<MovieResponse> getAllMovies(Pageable pageable) {
        return movieRepository
                .findAll(pageable)
                .map(this::mapToResponse);
    }

    // Get movies by language
    @Transactional(readOnly = true)
    public Page<MovieResponse> getMoviesByLanguage(String language, Pageable pageable) {
        return movieRepository.findByLanguageIgnoreCase(language, pageable).map(this::mapToResponse);
    }

    // Search movies by title
    @Transactional(readOnly = true)
    public Page<MovieResponse> searchMovies(String title, Pageable pageable) {
        return movieRepository
                .findByTitleContainingIgnoreCase(title, pageable)
                .map(this::mapToResponse);
    }

    // =========================================================
    // ADMIN FUNCTIONS
    // =========================================================

    // Get movie by UUID
    @Transactional(readOnly = true)
    public MovieResponse getByUuid(UUID movieUuid) {
        Movie movie = findMovieByUuid(movieUuid);
        return mapToResponse(movie);
    }

    // Create movie
    public MovieResponse create(MovieRequest request) {
        if (request.getImdbId() != null && movieRepository.existsByImdbId(request.getImdbId())) {
            throw new IllegalStateException(
                    "Movie with IMDb ID already exists"
            );
        }
        Movie movie = new Movie();
        mapRequestToEntity(request, movie);
        Movie savedMovie = movieRepository.save(movie);
        return mapToResponse(savedMovie);
    }

    // Update movie
    public MovieResponse update(UUID movieUuid, MovieRequest request) {
        Movie movie = findMovieByUuid(movieUuid);
        if (request.getImdbId() != null &&
                !request.getImdbId().equals(movie.getImdbId()) &&
                movieRepository.existsByImdbId(request.getImdbId())) {

            throw new IllegalStateException(
                    "Movie with IMDb ID already exists"
            );
        }
        mapRequestToEntity(request, movie);
        Movie updatedMovie = movieRepository.save(movie);
        return mapToResponse(updatedMovie);
    }

    // Delete movie
    public void delete(UUID movieUuid) {
        Movie movie = findMovieByUuid(movieUuid);
        movieRepository.delete(movie);
    }

    public MovieResponse importMovieFromOmdb(String imdbId) {
        // 1. Check if movie already exists
        if (movieRepository.existsByImdbId(imdbId)) {
            throw new IllegalStateException(
                    "Movie with IMDb ID already exists: " + imdbId
            );
        }
        // 2. Fetch movie from OMDb
        OmdbMovieResponse omdbMovie = omdbService.getMovieByImdbId(imdbId);

        // 3. Validate OMDb response
        if (omdbMovie == null || !"True".equalsIgnoreCase(omdbMovie.getResponse())) {
            throw new ResourceNotFoundException(
                    "Movie not found in OMDb with IMDb ID: " + imdbId
            );
        }
        // 4. Convert OMDb response -> MovieRequest
        MovieRequest request = convertOmdbToMovieRequest(omdbMovie);
        // 5. Reuse existing create() method
        return create(request);
    }

    // =========================================================
    // HELPER METHODS
    // =========================================================

    private Movie findMovieByUuid(UUID movieUuid) {
        return movieRepository.findByMovieUuid(movieUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Movie not found with UUID: " + movieUuid
                        )
                );
    }

    private void mapRequestToEntity(MovieRequest request, Movie movie) {
        movie.setTitle(request.getTitle());
        movie.setYear(request.getYear());
        movie.setRated(request.getRated());
        movie.setReleased(
                parseOmdbDate(request.getReleased())
        );
        movie.setRuntime(request.getRuntime());
        movie.setGenre(request.getGenre());
        movie.setDirector(request.getDirector());
        movie.setWriter(request.getWriter());
        movie.setActors(request.getActors());
        movie.setPlot(request.getPlot());
        movie.setLanguage(request.getLanguage());
        movie.setCountry(request.getCountry());
        movie.setAwards(request.getAwards());
        movie.setPoster(request.getPoster());
        movie.setMetascore(request.getMetascore());
        movie.setImdbRating(request.getImdbRating());
        movie.setImdbVotes(request.getImdbVotes());
        movie.setImdbId(request.getImdbId());
        movie.setType(request.getType());
        movie.setBoxOffice(request.getBoxOffice());
        movie.setRatings(request.getRatings());
    }

    private LocalDate parseOmdbDate(String releasedDate) {
        if (releasedDate == null ||
                releasedDate.isBlank() ||
                releasedDate.equalsIgnoreCase("N/A")) {
            return null;
        }
        try {
            return LocalDate.parse(
                    releasedDate.trim(),
                    OMDB_DATE_FORMAT
            );
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException(
                    "Invalid release date format. Expected format: dd MMM yyyy"
            );
        }
    }

    private MovieResponse mapToResponse(Movie movie) {
        return new MovieResponse(
                movie.getMovieUuid(),
                movie.getTitle(),
                movie.getYear(),
                movie.getRated(),
                movie.getReleased(),
                movie.getRuntime(),
                movie.getGenre(),
                movie.getDirector(),
                movie.getWriter(),
                movie.getActors(),
                movie.getPlot(),
                movie.getLanguage(),
                movie.getCountry(),
                movie.getAwards(),
                movie.getPoster(),
                movie.getMetascore(),
                movie.getImdbRating(),
                movie.getImdbVotes(),
                movie.getImdbId(),
                movie.getType(),
                movie.getBoxOffice(),
                movie.getRatings(),
                movie.getCreatedAt(),
                movie.getUpdatedAt()
        );
    }

    private MovieRequest convertOmdbToMovieRequest(OmdbMovieResponse omdbMovie) {
        MovieRequest request = new MovieRequest();
        request.setTitle(omdbMovie.getTitle());
        request.setYear(
                parseInteger(omdbMovie.getYear())
        );
        request.setRated(omdbMovie.getRated());
        request.setReleased(omdbMovie.getReleased());
        request.setRuntime(
                parseRuntime(omdbMovie.getRuntime())
        );
        request.setGenre(omdbMovie.getGenre());
        request.setDirector(omdbMovie.getDirector());
        request.setWriter(omdbMovie.getWriter());
        request.setActors(omdbMovie.getActors());
        request.setPlot(omdbMovie.getPlot());
        request.setLanguage(omdbMovie.getLanguage());
        request.setCountry(omdbMovie.getCountry());
        request.setAwards(omdbMovie.getAwards());
        request.setPoster(omdbMovie.getPoster());
        request.setMetascore(
                parseDouble(omdbMovie.getMetascore())
        );
        request.setImdbRating(
                parseDouble(omdbMovie.getImdbRating())
        );
        request.setImdbVotes(
                parseIntegerWithCommas(omdbMovie.getImdbVotes())
        );

        request.setImdbId(omdbMovie.getImdbId());
        request.setType(omdbMovie.getType());
        request.setBoxOffice(omdbMovie.getBoxOffice());
        request.setRatings(
                omdbMovie.getRatings()
                        .stream()
                        .map(rating ->
                                new MovieRating(
                                        rating.getSource(),
                                        rating.getValue()
                                )
                        )
                        .toList()
        );
        return request;
    }

    private Integer parseInteger(String value) {
        if (value == null ||
                value.isBlank() ||
                value.equalsIgnoreCase("N/A")) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Integer parseRuntime(String runtime) {
        if (runtime == null ||
                runtime.isBlank() ||
                runtime.equalsIgnoreCase("N/A")) {
            return null;
        }
        try {
            return Integer.parseInt(
                    runtime.replaceAll("[^0-9]", "")
            );
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Integer parseIntegerWithCommas(String value) {
        if (value == null ||
                value.isBlank() ||
                value.equalsIgnoreCase("N/A")) {

            return null;
        }
        try {
            return Integer.parseInt(
                    value.replace(",", "").trim()
            );
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        if (value == null ||
                value.isBlank() ||
                value.equalsIgnoreCase("N/A")) {
            return null;
        }
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}