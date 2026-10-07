package com.example.learnermanagement.service;

import com.example.learnermanagement.entity.User;
import com.example.learnermanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentService {
    private final UserRepository userRepository;

    public StudentService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllStudents() {
        return userRepository.findAll().stream()
                .filter(u -> "STUDENT".equalsIgnoreCase(u.getRole()))
                .toList();
    }

    public User getStudentById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (!"STUDENT".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("User is not a student");
        }
        return user;
    }

    public User addStudent(User student) {
        if (userRepository.existsByUsername(student.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        student.setRole("STUDENT");
        return userRepository.save(student);
    }

    public User updateStudent(Long id, User updatedStudent) {
        User existing = getStudentById(id);
        existing.setUsername(updatedStudent.getUsername());
        existing.setPassword(updatedStudent.getPassword());
        return userRepository.save(existing);
    }

    public void deleteStudent(Long id) {
        userRepository.delete(getStudentById(id));
    }
}
