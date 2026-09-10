package com.jagnyadatta.NextMovie.dto.response;

import com.jagnyadatta.NextMovie.enums.Role;
import com.jagnyadatta.NextMovie.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private UUID userUuid;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
