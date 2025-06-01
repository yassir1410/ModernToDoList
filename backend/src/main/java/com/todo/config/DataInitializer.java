package com.todo.config;

import com.todo.model.Todo;
import com.todo.model.User;
import com.todo.repository.TodoRepository;
import com.todo.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserService userService;
    private final TodoRepository todoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserService userService, TodoRepository todoRepository, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.todoRepository = todoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        logger.info("Starting data initialization...");
        
        // Clear existing data
        logger.info("Clearing existing data...");
        todoRepository.deleteAll();
        userService.deleteAllUsers();
        
        // Create test users with their todos
        createUserWithTodos("admin", "admin@example.com", "admin123", "Admin User");
        createUserWithTodos("john.doe", "john.doe@example.com", "password123", "John Doe");
        createUserWithTodos("alice.johnson", "alice.johnson@example.com", "password123", "Alice Johnson");
        createUserWithTodos("bob.smith", "bob.smith@example.com", "password123", "Bob Smith");
        
        logger.info("Data initialization completed.");
    }

    private void createUserWithTodos(String username, String email, String password, String fullName) {
        if (!userService.existsByUsername(username)) {
            logger.info("Creating user: {}", username);
            
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password); // Store password as plain text
            user.setFullName(fullName);
            
            User savedUser = userService.register(user);
            logger.info("User created successfully: {}", savedUser.getUsername());

            // Create sample todos for the user
            createTodo(savedUser, "Complete project documentation", 
                "Write comprehensive documentation for the project", false, "Work");
            
            createTodo(savedUser, "Review pull requests", 
                "Review and provide feedback on team pull requests", false, "Work");
            
            createTodo(savedUser, "Update dependencies", 
                "Update project dependencies to latest versions", true, "Maintenance");
            
            createTodo(savedUser, "Schedule team meeting", 
                "Schedule weekly team sync meeting", false, "Meeting");
            
            createTodo(savedUser, "Prepare presentation", 
                "Prepare slides for the upcoming client presentation", false, "Presentation");
        }
    }

    private void createTodo(User user, String title, String description, boolean completed, String category) {
        Todo todo = new Todo();
        todo.setTitle(title);
        todo.setDescription(description);
        todo.setCompleted(completed);
        todo.setCategory(category);
        todo.setUser(user);
        todo.setCreatedAt(LocalDateTime.now());
        todo.setUpdatedAt(LocalDateTime.now());
        
        todoRepository.save(todo);
        logger.info("Created todo: {} for user: {}", title, user.getUsername());
    }
} 