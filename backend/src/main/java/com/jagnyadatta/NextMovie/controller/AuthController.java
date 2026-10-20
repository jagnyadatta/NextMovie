package com.jagnyadatta.NextMovie.controller;

import com.jagnyadatta.NextMovie.dto.request.LoginRequest;
import com.jagnyadatta.NextMovie.dto.request.ResendOtpRequest;
import com.jagnyadatta.NextMovie.dto.request.SendOtpRequest;
import com.jagnyadatta.NextMovie.dto.request.SignupRequest;
import com.jagnyadatta.NextMovie.dto.request.VerifyOtpRequest;
import com.jagnyadatta.NextMovie.dto.response.ApiResponse;
import com.jagnyadatta.NextMovie.dto.response.LoginResponse;
import com.jagnyadatta.NextMovie.security.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@Valid @RequestBody SignupRequest request){
        String message = authService.signup(request);
        ApiResponse<Void> response = ApiResponse.success(
                HttpStatus.CREATED.value(),
                message,
                null
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request){
        LoginResponse loginResponse = authService.login(request);
        ApiResponse<LoginResponse> response = ApiResponse.success(
                HttpStatus.OK.value(),
                "Login successful",
                loginResponse
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        String message = authService.sendOtp(request);
        ApiResponse<Void> response = ApiResponse.success(
                HttpStatus.OK.value(),
                message,
                null
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String message = authService.verifyOtp(request);
        ApiResponse<Void> response = ApiResponse.success(
                HttpStatus.OK.value(),
                message,
                null
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        String message = authService.resendOtp(request);
        ApiResponse<Void> response = ApiResponse.success(
                HttpStatus.OK.value(),
                message,
                null
        );
        return ResponseEntity.ok(response);
    }
}
