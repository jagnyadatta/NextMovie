package com.jagnyadatta.NextMovie.repository;

import com.jagnyadatta.NextMovie.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findByMovieUuid(UUID movieUuid);
    Page<Movie> findAllByOrderByReleasedDesc(Pageable pageable);
    Page<Movie> findByLanguageIgnoreCase(String language, Pageable pageable);
    Page<Movie> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    boolean existsByImdbId(String imdbId);
}