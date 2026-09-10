package com.jagnyadatta.NextMovie.controller;

import com.jagnyadatta.NextMovie.dto.request.UpdateUserRoleRequest;
import com.jagnyadatta.NextMovie.dto.request.UpdateUserStatusRequest;
import com.jagnyadatta.NextMovie.dto.response.ApiResponse;
import com.jagnyadatta.NextMovie.dto.response.UserResponse;
import com.jagnyadatta.NextMovie.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    // Get all users
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAll();
        ApiResponse<List<UserResponse>> response = ApiResponse.success(
                HttpStatus.OK.value(),
                "Users fetched successfully",
                users
        );
        return ResponseEntity.ok(response);
    }

    // Get user by UUID
    @GetMapping("/{userUuid}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByUuid(
            @PathVariable UUID userUuid) {
        UserResponse user = userService.getByUuid(userUuid);
        ApiResponse<UserResponse> response = ApiResponse.success(
                HttpStatus.OK.value(),
                "User fetched successfully",
                user
        );
        return ResponseEntity.ok(response);
    }

    // Change user role
    @PatchMapping("/{userUuid}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable UUID userUuid,
            @RequestBody UpdateUserRoleRequest request) {
        UserResponse user = userService.updateRole(userUuid, request);
        ApiResponse<UserResponse> response = ApiResponse.success(
                HttpStatus.OK.value(),
                "User role updated successfully",
                user
        );
        return ResponseEntity.ok(response);
    }

    // Enable / disable user account
    @PatchMapping("/{userUuid}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable UUID userUuid,
            @RequestBody UpdateUserStatusRequest request) {
        UserResponse user = userService.updateStatus(userUuid, request);
        ApiResponse<UserResponse> response = ApiResponse.success(
                HttpStatus.OK.value(),
                "User status updated successfully",
                user
        );
        return ResponseEntity.ok(response);
    }

    // Delete user
    @DeleteMapping("/{userUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userUuid) {
        userService.delete(userUuid);
        ApiResponse<Void> response = ApiResponse.success(
                HttpStatus.OK.value(),
                "User deleted successfully",
                null
        );
        return ResponseEntity.ok(response);
    }
}