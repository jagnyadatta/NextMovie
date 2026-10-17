package com.jagnyadatta.NextMovie.repository;

import com.jagnyadatta.NextMovie.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingUuid(UUID bookingUuid);

    Page<Booking> findByUser_EmailIgnoreCaseOrderByCreatedAtDesc(
            String email,
            Pageable pageable
    );

    Page<Booking> findAllByOrderByCreatedAtDesc(
            Pageable pageable
    );

    Optional<Booking> findByBookingUuidAndUser_EmailIgnoreCase(
            UUID bookingUuid,
            String email
    );
}