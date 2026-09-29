package com.jagnyadatta.NextMovie.repository;

import com.jagnyadatta.NextMovie.entity.Screen;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ScreenRepository extends JpaRepository<Screen, Long> {
    Optional<Screen> findByScreenUuid(UUID screenUuid);
    Page<Screen> findByTheatre_TheatreUuidAndActiveTrue(
            UUID theatreUuid,
            Pageable pageable
    );
    boolean existsByTheatre_TheatreUuidAndNameIgnoreCase(
            UUID theatreUuid,
            String name
    );
}