package com.jagnyadatta.NextMovie.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jagnyadatta.NextMovie.dto.response.ApiResponse;
import com.jagnyadatta.NextMovie.entity.User;
import com.jagnyadatta.NextMovie.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final UserRepository userRepo;
    private final AuthUtil authUtil;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.info("Incoming request: {}", request.getRequestURI());
        final String requestTokenHeader = request.getHeader("Authorization");
        if(requestTokenHeader == null || !requestTokenHeader.startsWith("Bearer ")){
            filterChain.doFilter(request, response);
            return;
        }
        String token = requestTokenHeader.substring(7);
        try{
            String email = authUtil.getEmailFromJwtToken(token);
            if(email != null && SecurityContextHolder.getContext().getAuthentication() == null){
                User user = userRepo.findByEmail(email).orElseThrow(()->
                    new UsernameNotFoundException("User not found with email: " + email)
                );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user, null, user.getAuthorities()
                        );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
            filterChain.doFilter(request, response);
        } catch(ExpiredJwtException ex){
            log.warn("JWT token has expired: {}", token);
            sendErrorResponse(
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "JWT token has expired"
            );
        } catch (JwtException ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
            sendErrorResponse(
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid JWT token"
            );
        }
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        ApiResponse<Void> apiResponse = ApiResponse.error(status, message);

        response.setStatus(status);
        response.setContentType("application/json");

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
