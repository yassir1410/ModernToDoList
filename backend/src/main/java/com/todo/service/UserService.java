package com.todo.service;

import com.todo.model.User;
import com.todo.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;

@Service
public class UserService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            new ArrayList<>()
        );
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElse(null);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User register(User user) {
        logger.info("Registering new user: {}", user.getUsername());
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public void deleteAllUsers() {
        logger.info("Deleting all users");
        try {
            userRepository.deleteAll();
            logger.info("All users deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting all users: {}", e.getMessage(), e);
            throw e;
        }
    }

    public User updateProfile(String username, String fullName, String email, String currentPassword, String newPassword) {
        logger.info("Updating profile for user: {}", username);
        User user = findByUsername(username);

        // Update basic info
        if (fullName != null && !fullName.equals(user.getFullName())) {
            user.setFullName(fullName);
        }

        if (email != null && !email.equals(user.getEmail())) {
            // Check if email is already taken
            if (existsByEmail(email)) {
                throw new RuntimeException("Email is already taken");
            }
            user.setEmail(email);
        }

        // Update password if provided
        if (newPassword != null && !newPassword.isEmpty()) {
            if (currentPassword == null || currentPassword.isEmpty()) {
                throw new RuntimeException("Current password is required to set a new password");
            }

            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }

            // Set new password
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        return userRepository.save(user);
    }
} 