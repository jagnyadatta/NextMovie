package com.jagnyadatta.NextMovie.repository;

import com.jagnyadatta.NextMovie.entity.Seat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    Optional<Seat> findBySeatUuid(UUID seatUuid);
    Page<Seat> findByScreen_ScreenUuidAndActiveTrue(
            UUID screenUuid,
            Pageable pageable
    );
    boolean existsByScreen_ScreenUuidAndSeatNumber(
            UUID screenUuid,
            String seatNumber
    );
}