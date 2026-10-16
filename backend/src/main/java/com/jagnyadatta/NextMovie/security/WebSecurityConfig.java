package com.jagnyadatta.NextMovie.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    // Public GET endpoints (no authentication required)
    private static final String[] PUBLIC_GET_ENDPOINTS = {
            // Movies
            "/movies",
            "/movies/recent",
            "/movies/language/**",
            "/movies/search",

            // Theatres
            "/theatres",
            "/theatres/city/**",
            "/theatres/*/screens",
            "/theatres/*",

            // Screens
            "/screens/theatre/**",
            "/screens/byid/**",
            "/screens/*/seats",

            // Seats
            "/seats/screen/**",
            "/seats/byid/*",

            // Shows
            "/shows",
            "/shows/movie/**",
            "/shows/theatre/**",
            "/shows/city/**",
            "/shows/*/seats",
            "/shows/*/available-seats",
            "/shows/*",

            // Show Seats
            "/show-seats/show/**",
            "/show-seats/show/*/available",
            "/show-seats/*"
    };

    // Public non-GET endpoints (no authentication required)
    private static final String[] PUBLIC_ANY_ENDPOINTS = {
            "/auth/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exception -> exception
                        // No token / invalid authentication
                        .authenticationEntryPoint(authenticationEntryPoint)
                        // Authenticated but insufficient role
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ANY_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // React frontend
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // HTTP methods
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );
        // Request headers
        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        // Response headers that frontend can access
        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        // Only needed if you use cookies
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
