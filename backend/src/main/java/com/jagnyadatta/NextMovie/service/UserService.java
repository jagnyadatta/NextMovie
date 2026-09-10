package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.dto.request.UpdateUserRoleRequest;
import com.jagnyadatta.NextMovie.dto.request.UpdateUserStatusRequest;
import com.jagnyadatta.NextMovie.dto.response.UserResponse;
import com.jagnyadatta.NextMovie.entity.User;
import com.jagnyadatta.NextMovie.exception.ResourceNotFoundException;
import com.jagnyadatta.NextMovie.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    // Get all users
    public List<UserResponse> getAll() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get user by UUID
    public UserResponse getByUuid(UUID userUuid) {
        User user = findUserByUuid(userUuid);
        return mapToResponse(user);
    }

    // Update user role
    public UserResponse updateRole(
            UUID userUuid,
            UpdateUserRoleRequest request) {
        User user = findUserByUuid(userUuid);
        user.setRole(request.getRole());
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    // Enable / disable user account
    public UserResponse updateStatus(
            UUID userUuid,
            UpdateUserStatusRequest request) {
        User user = findUserByUuid(userUuid);
        user.setStatus(request.getStatus());
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    // Delete user
    public void delete(UUID userUuid) {
        User user = findUserByUuid(userUuid);
        userRepository.delete(user);
    }

    // Find user by public UUID
    private User findUserByUuid(UUID userUuid) {
        return userRepository.findByUserUuid(userUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with UUID: " + userUuid
                        )
                );
    }

    // Map Entity -> Response DTO
    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getUserUuid(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}