package com.jagnyadatta.NextMovie.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private int status;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(
            int status,
            String message,
            T data
    ) {
        return new ApiResponse<>(
                true,
                status,
                message,
                data,
                LocalDateTime.now()
        );
    }

    public static <T> ApiResponse<T> error(
            int status,
            String message
    ) {
        return new ApiResponse<>(
                false,
                status,
                message,
                null,
                LocalDateTime.now()
        );
    }
}
