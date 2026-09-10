package com.jagnyadatta.NextMovie.dto.request;

import com.jagnyadatta.NextMovie.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRoleRequest {
    private Role role;
}
