package com.todo.controller;

import com.todo.model.User;
import com.todo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> updates,
            Authentication authentication) {
        logger.info("Updating profile for user: {}", authentication.getName());
        try {
            String fullName = updates.get("fullName");
            String email = updates.get("email");
            String currentPassword = updates.get("currentPassword");
            String newPassword = updates.get("newPassword");

            User updatedUser = userService.updateProfile(
                authentication.getName(),
                fullName,
                email,
                currentPassword,
                newPassword
            );

            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            logger.error("Error updating profile: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 