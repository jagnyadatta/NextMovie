package com.jagnyadatta.NextMovie.dto.request;

import com.jagnyadatta.NextMovie.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserStatusRequest {
    private UserStatus status;
}
