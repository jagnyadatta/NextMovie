package com.jagnyadatta.NextMovie.repository;

import com.jagnyadatta.NextMovie.entity.Show;
import com.jagnyadatta.NextMovie.enums.ShowStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

public interface ShowRepository extends JpaRepository<Show, Long> {
    Optional<Show> findByShowUuid(UUID showUuid);
    Page<Show> findByActiveTrueAndShowDateGreaterThanEqual(
            LocalDate date,
            Pageable pageable
    );
    Page<Show> findByMovie_MovieUuidAndActiveTrueAndShowDateGreaterThanEqual(
            UUID movieUuid,
            LocalDate date,
            Pageable pageable
    );
    Page<Show> findByScreen_Theatre_TheatreUuidAndActiveTrueAndShowDateGreaterThanEqual(
            UUID theatreUuid,
            LocalDate date,
            Pageable pageable
    );
    Page<Show> findByScreen_Theatre_CityIgnoreCaseAndActiveTrueAndShowDateGreaterThanEqual(
            String city,
            LocalDate date,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(s) > 0
        FROM Show s
        WHERE s.screen.screenUuid = :screenUuid
        AND s.showDate = :showDate
        AND s.status <> :cancelled
        AND s.startTime < :newEndTime
        AND s.endTime > :newStartTime
        """)
    boolean existsOverlappingShow(
            @Param("screenUuid") UUID screenUuid,
            @Param("showDate") LocalDate showDate,
            @Param("newStartTime") LocalTime newStartTime,
            @Param("newEndTime") LocalTime newEndTime,
            @Param("cancelled") ShowStatus cancelled
    );
}