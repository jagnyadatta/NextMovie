package com.jagnyadatta.NextMovie.dto.request;

import com.jagnyadatta.NextMovie.entity.MovieRating;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovieRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private Integer year;
    private String rated;
    private String released;
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
}