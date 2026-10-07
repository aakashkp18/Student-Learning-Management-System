package com.example.learnermanagement.service;

import com.example.learnermanagement.entity.Course;
import com.example.learnermanagement.repository.CourseRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CourseService {
    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public Course addCourse(Course course) {
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public Course updateCourse(Long id, Course updated) {
        Course existing = getCourseById(id);
        existing.setCourseName(updated.getCourseName());
        existing.setMentorName(updated.getMentorName());
        existing.setDuration(updated.getDuration());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setContent(updated.getContent());
        existing.setRequirements(updated.getRequirements());
        return courseRepository.save(existing);
    }

    public void deleteCourse(Long id) {
        courseRepository.delete(getCourseById(id));
    }
}
