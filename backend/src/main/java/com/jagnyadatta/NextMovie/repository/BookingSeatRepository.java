package com.jagnyadatta.NextMovie.repository;

import com.jagnyadatta.NextMovie.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookingSeatRepository
        extends JpaRepository<BookingSeat, Long> {

    List<BookingSeat> findByBooking_BookingUuid(UUID bookingUuid);
}