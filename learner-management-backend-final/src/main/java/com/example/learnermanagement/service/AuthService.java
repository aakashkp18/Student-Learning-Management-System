package com.example.learnermanagement.service;

import com.example.learnermanagement.entity.User;
import com.example.learnermanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        user.setRole("STUDENT");
        return userRepository.save(user);
    }

    public User login(String username, String password, String role) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }
        if (!user.getRole().equalsIgnoreCase(role)) {
            throw new RuntimeException("Invalid role");
        }
        return user;
    }
}
