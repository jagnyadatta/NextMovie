package com.jagnyadatta.NextMovie.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class MovieRating {
    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String value;
}