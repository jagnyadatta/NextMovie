package com.jagnyadatta.NextMovie.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(
        name = "movies",
        indexes = {
                @Index(name = "idx_movie_title", columnList = "title"),
                @Index(name = "idx_movie_released", columnList = "released"),
                @Index(name = "idx_movie_language", columnList = "language")
        }
)
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @UuidGenerator
    @Column(
            name = "movie_uuid",
            nullable = false,
            unique = true,
            updatable = false
    )
    private UUID movieUuid;

    @Column(nullable = false)
    private String title;

    private Integer year;

    private String rated;

    private LocalDate released;

    private Integer runtime;

    private String genre;

    private String director;

    @Column(length = 1000)
    private String writer;

    @Column(length = 1000)
    private String actors;

    @Column(length = 2000)
    private String plot;

    private String language;

    private String country;

    @Column(length = 1000)
    private String awards;

    @Column(length = 1000)
    private String poster;

    private Double metascore;

    private Double imdbRating;

    private Integer imdbVotes;

    @Column(unique = true)
    private String imdbId;

    private String type;

    private String boxOffice;

    @ElementCollection
    @CollectionTable(
            name = "movie_ratings",
            joinColumns = @JoinColumn(name = "movie_id")
    )
    private List<MovieRating> ratings;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}