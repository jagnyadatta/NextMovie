package com.jagnyadatta.NextMovie.dto.response;

import com.jagnyadatta.NextMovie.entity.MovieRating;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovieResponse {
    private UUID movieUuid;
    private String title;
    private Integer year;
    private String rated;
    private LocalDate released;
    private Integer runtime;
    private String genre;
    private String director;
    private String writer;
    private String actors;
    private String plot;
    private String language;
    private String country;
    private String awards;
    private String poster;
    private Double metascore;
    private Double imdbRating;
    private Integer imdbVotes;
    private String imdbId;
    private String type;
    private String boxOffice;

    private List<MovieRating> ratings;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}