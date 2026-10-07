package com.example.learnermanagement.config;

import com.example.learnermanagement.entity.User;
import com.example.learnermanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User("admin", "admin123", "ADMIN");
                userRepository.save(admin);
                System.out.println("Default admin created: admin / admin123");
            }
        };
    }
}
