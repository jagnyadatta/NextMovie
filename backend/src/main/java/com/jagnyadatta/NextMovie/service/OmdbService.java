package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.dto.external.OmdbMovieResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class OmdbService {

    private final RestClient restClient;

    @Value("${omdb.api.url}")
    private String omdbApiUrl;

    @Value("${omdb.api.key}")
    private String omdbApiKey;

    public OmdbMovieResponse getMovieByImdbId(String imdbId) {

        String url = UriComponentsBuilder
                .fromUriString(omdbApiUrl)
                .queryParam("apikey", omdbApiKey)
                .queryParam("i", imdbId)
                .queryParam("plot", "full")
                .toUriString();

        return restClient
                .get()
                .uri(url)
                .retrieve()
                .body(OmdbMovieResponse.class);
    }
}