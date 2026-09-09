package com.jagnyadatta.NextMovie.security;

import com.jagnyadatta.NextMovie.dto.request.LoginRequest;
import com.jagnyadatta.NextMovie.dto.request.SignupRequest;
import com.jagnyadatta.NextMovie.dto.response.LoginResponse;
import com.jagnyadatta.NextMovie.dto.response.UserResponse;
import com.jagnyadatta.NextMovie.entity.User;
import com.jagnyadatta.NextMovie.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = (User) authentication.getPrincipal();
        String token = authUtil.generateJwtToken(user);
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
        return new LoginResponse(token, userResponse);
    }

    public String signup(SignupRequest request){
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if(user != null){
            throw new IllegalStateException("User already exists");
        }
        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setName(request.getName());
        newUser.setPhone(request.getPhone());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(newUser);
        return "Registered Successfully";
    }
}
