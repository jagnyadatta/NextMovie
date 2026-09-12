package com.jagnyadatta.NextMovie.repository;

import com.jagnyadatta.NextMovie.entity.Theatre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TheatreRepository extends JpaRepository<Theatre, Long> {
    Optional<Theatre> findByTheatreUuid(UUID theatreUuid);
    Page<Theatre> findByActiveTrue(Pageable pageable);
    Page<Theatre> findByCityIgnoreCaseAndActiveTrue(
            String city,
            Pageable pageable
    );
    boolean existsByNameIgnoreCaseAndCityIgnoreCase(
            String name,
            String city
    );
}