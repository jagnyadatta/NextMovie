package com.jagnyadatta.NextMovie.repository;

import com.jagnyadatta.NextMovie.entity.ShowSeat;
import com.jagnyadatta.NextMovie.enums.ShowSeatStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {
    Optional<ShowSeat> findByShowSeatUuid(UUID showSeatUuid);

    Page<ShowSeat> findByShow_ShowUuid(
            UUID showUuid,
            Pageable pageable
    );

    Page<ShowSeat> findByShow_ShowUuidAndStatus(
            UUID showUuid,
            ShowSeatStatus status,
            Pageable pageable
    );

    List<ShowSeat> findByShow_ShowUuidAndStatus(
            UUID showUuid,
            ShowSeatStatus status
    );

    boolean existsByShow_ShowUuidAndSeat_SeatUuid(
            UUID showUuid,
            UUID seatUuid
    );
}