package com.jagnyadatta.NextMovie.repository;

import com.jagnyadatta.NextMovie.entity.ShowSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT ss
    FROM ShowSeat ss
    WHERE ss.showSeatUuid IN :uuids
    ORDER BY ss.id
    """)
    List<ShowSeat> findAllByUuidInForUpdate(
            @Param("uuids") List<UUID> uuids
    );
}