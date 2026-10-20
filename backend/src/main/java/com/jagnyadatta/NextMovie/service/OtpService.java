package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.entity.OtpVerification;
import com.jagnyadatta.NextMovie.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpVerificationRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.expiry-minutes:5}")
    private int expiryMinutes;

    /**
     * Generates a secure 6-digit OTP, stores it in the database, and sends an interactive HTML email.
     *
     * @param email         user email address
     * @param recipientName user name or null
     * @return the generated OTP
     */
    @Transactional
    public String generateAndSendOtp(String email, String recipientName) {
        String normalizedEmail = email.trim().toLowerCase();

        // Invalidate any existing unused OTPs for this email to avoid replay
        List<OtpVerification> existingOtps = otpVerificationRepository.findByEmailAndIsUsedFalse(normalizedEmail);
        for (OtpVerification oldOtp : existingOtps) {
            oldOtp.setUsed(true);
        }
        otpVerificationRepository.saveAll(existingOtps);

        // Generate cryptographically secure 6-digit OTP (100000 - 999999)
        int randomCode = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(randomCode);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryTime = now.plusMinutes(expiryMinutes);

        OtpVerification otpVerification = OtpVerification.builder()
                .email(normalizedEmail)
                .otp(otp)
                .expiryTime(expiryTime)
                .isUsed(false)
                .build();

        otpVerificationRepository.save(otpVerification);
        log.info("Generated new OTP for email {}. Expires at {}", normalizedEmail, expiryTime);

        // Send the interactive HTML email
        emailService.sendOtpEmail(normalizedEmail, recipientName, otp);

        return otp;
    }

    /**
     * Validates and consumes the OTP for the given email.
     *
     * @param email user email address
     * @param otp   user submitted OTP code
     * @return true if valid and consumed
     */
    @Transactional
    public boolean verifyOtp(String email, String otp) {
        String normalizedEmail = email.trim().toLowerCase();
        String cleanOtp = otp != null ? otp.trim() : "";

        Optional<OtpVerification> otpOpt = otpVerificationRepository
                .findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(normalizedEmail);

        if (otpOpt.isEmpty()) {
            log.warn("No active OTP found for email {}", normalizedEmail);
            throw new IllegalArgumentException("No active OTP found for this email. Please request a new OTP.");
        }

        OtpVerification verification = otpOpt.get();

        if (verification.isExpired()) {
            log.warn("OTP for email {} has expired at {}", normalizedEmail, verification.getExpiryTime());
            throw new IllegalArgumentException("The OTP has expired. Please request a new OTP.");
        }

        if (!verification.getOtp().equals(cleanOtp)) {
            log.warn("Invalid OTP entered for email {}", normalizedEmail);
            throw new IllegalArgumentException("Invalid OTP code. Please enter the correct 6-digit code.");
        }

        // Mark OTP as used so it cannot be reused
        verification.setUsed(true);
        otpVerificationRepository.save(verification);
        log.info("OTP verified and consumed successfully for email {}", normalizedEmail);

        return true;
    }

    /**
     * Checks if the email was successfully verified within the last 15 minutes.
     *
     * @param email user email
     * @return true if verified recently
     */
    public boolean isEmailVerifiedRecently(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        Optional<OtpVerification> latestOpt = otpVerificationRepository
                .findTopByEmailOrderByCreatedAtDesc(normalizedEmail);

        if (latestOpt.isEmpty()) {
            return false;
        }

        OtpVerification verification = latestOpt.get();
        return verification.isUsed()
                && verification.getCreatedAt() != null
                && verification.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(15));
    }
}
