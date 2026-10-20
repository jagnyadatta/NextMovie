package com.jagnyadatta.NextMovie.security;

import com.jagnyadatta.NextMovie.dto.request.LoginRequest;
import com.jagnyadatta.NextMovie.dto.request.ResendOtpRequest;
import com.jagnyadatta.NextMovie.dto.request.SendOtpRequest;
import com.jagnyadatta.NextMovie.dto.request.SignupRequest;
import com.jagnyadatta.NextMovie.dto.request.VerifyOtpRequest;
import com.jagnyadatta.NextMovie.dto.response.LoginResponse;
import com.jagnyadatta.NextMovie.dto.response.UserResponse;
import com.jagnyadatta.NextMovie.entity.User;
import com.jagnyadatta.NextMovie.repository.UserRepository;
import com.jagnyadatta.NextMovie.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public LoginResponse login(LoginRequest request){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = (User) authentication.getPrincipal();
        String token = authUtil.generateJwtToken(user);
        UserResponse userResponse = new UserResponse(
                user.getUserUuid(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
        return new LoginResponse(token, userResponse);
    }

    public String signup(SignupRequest request){
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if(user != null){
            throw new IllegalStateException("User already exists");
        }

        // If an OTP was provided in the signup payload, verify it
        if (request.getOtp() != null && !request.getOtp().trim().isEmpty()) {
            otpService.verifyOtp(request.getEmail(), request.getOtp().trim());
        }

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setName(request.getName());
        newUser.setPhone(request.getPhone());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(newUser);

        // If OTP wasn't already provided during signup, send the interactive OTP email for email verification
        if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
            try {
                otpService.generateAndSendOtp(request.getEmail(), request.getName());
            } catch (Exception e) {
                log.warn("Could not dispatch OTP email for {}: {}", request.getEmail(), e.getMessage());
            }
        }

        return "Registered Successfully";
    }

    public String sendOtp(SendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user != null) {
            throw new IllegalStateException("User already exists with this email");
        }
        otpService.generateAndSendOtp(request.getEmail(), request.getName());
        return "OTP sent successfully to " + request.getEmail();
    }

    public String verifyOtp(VerifyOtpRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getOtp());
        return "OTP verified successfully";
    }

    public String resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user != null) {
            throw new IllegalStateException("User already exists with this email");
        }
        otpService.generateAndSendOtp(request.getEmail(), null);
        return "New OTP sent successfully to " + request.getEmail();
    }
}
