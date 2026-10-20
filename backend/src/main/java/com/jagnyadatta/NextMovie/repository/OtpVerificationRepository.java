package com.jagnyadatta.NextMovie.repository;

import com.jagnyadatta.NextMovie.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(String email);

    Optional<OtpVerification> findTopByEmailOrderByCreatedAtDesc(String email);

    List<OtpVerification> findByEmailAndIsUsedFalse(String email);

    void deleteByEmail(String email);
}
