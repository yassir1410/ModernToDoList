package com.todo.controller;

import com.todo.model.Todo;
import com.todo.model.User;
import com.todo.service.TodoService;
import com.todo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
public class TodoController {
    private static final Logger logger = LoggerFactory.getLogger(TodoController.class);

    private final TodoService todoService;
    private final UserService userService;

    public TodoController(TodoService todoService, UserService userService) {
        this.todoService = todoService;
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData(Authentication authentication) {
        logger.info("Fetching dashboard data for user: {}", authentication.getName());
        try {
            List<Todo> todos = todoService.getTodosByUsername(authentication.getName());
            
            Map<String, Object> response = new HashMap<>();
            
            // Calculate statistics
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", todos.size());
            stats.put("completed", todos.stream().filter(Todo::isCompleted).count());
            stats.put("pending", todos.stream().filter(todo -> !todo.isCompleted()).count());
            
            // Calculate category statistics
            Map<String, Long> byCategory = todos.stream()
                .collect(Collectors.groupingBy(Todo::getCategory, Collectors.counting()));
            stats.put("byCategory", byCategory);
            
            response.put("stats", stats);
            
            // Get recent todos (last 5)
            List<Todo> recentTodos = todos.stream()
                .sorted((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());
            response.put("recentTodos", recentTodos);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching dashboard data: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching dashboard data");
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllTodos() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            logger.info("Authentication: {}", auth);
            logger.info("Principal: {}", auth.getPrincipal());
            
            if (auth == null || auth.getPrincipal() == null) {
                logger.error("No authentication found");
                return ResponseEntity.status(401).body("Not authenticated");
            }

            String username = auth.getName();
            logger.info("Fetching todos for username: {}", username);
            
            User user = userService.findByUsername(username);
            logger.info("Found user: {}", user.getUsername());
            
            List<Todo> todos = todoService.findByUser(user);
            logger.info("Found {} todos for user: {}", todos.size(), username);
            
            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            logger.error("Error fetching todos: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error fetching todos: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTodo(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            logger.info("Fetching todo {} for user: {}", id, username);
            
            Todo todo = todoService.findByIdAndUser(id, user);
            return ResponseEntity.ok(todo);
        } catch (Exception e) {
            logger.error("Error fetching todo {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error fetching todo: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createTodo(@RequestBody Todo todo) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            logger.info("Creating new todo for user: {}", username);
            
            todo.setUser(user);
            Todo savedTodo = todoService.save(todo);
            return ResponseEntity.ok(savedTodo);
        } catch (Exception e) {
            logger.error("Error creating todo: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error creating todo: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTodo(@PathVariable Long id, @RequestBody Todo todo) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            logger.info("Updating todo {} for user: {}", id, username);
            
            Todo existingTodo = todoService.findByIdAndUser(id, user);
            todo.setId(existingTodo.getId());
            todo.setUser(user);
            return ResponseEntity.ok(todoService.save(todo));
        } catch (Exception e) {
            logger.error("Error updating todo {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error updating todo: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            logger.info("Deleting todo {} for user: {}", id, username);
            
            todoService.deleteByIdAndUser(id, user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting todo {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error deleting todo: " + e.getMessage());
        }
    }

    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedTodos() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            logger.info("Fetching completed todos for user: {}", username);
            
            List<Todo> todos = todoService.findByUserAndCompleted(user, true);
            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            logger.error("Error fetching completed todos: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error fetching completed todos: " + e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingTodos() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            logger.info("Fetching pending todos for user: {}", username);
            
            List<Todo> todos = todoService.findByUserAndCompleted(user, false);
            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            logger.error("Error fetching pending todos: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error fetching pending todos: " + e.getMessage());
        }
    }

    @GetMapping("/category/{category}")
    public List<Todo> getTodosByCategory(@PathVariable String category) {
        return todoService.getTodosByCategory(category);
    }

    @GetMapping("/priority/{priority}")
    public List<Todo> getTodosByPriority(@PathVariable Todo.Priority priority) {
        return todoService.getTodosByPriority(priority);
    }

    @GetMapping("/overdue")
    public List<Todo> getOverdueTodos() {
        return todoService.getOverdueTodos();
    }

    @GetMapping("/search")
    public List<Todo> searchTodos(@RequestParam String query) {
        return todoService.searchTodos(query);
    }

    @PostMapping("/{id}/subtasks")
    public ResponseEntity<Todo> addSubtask(
            @PathVariable Long id,
            @RequestBody Todo.Subtask subtask) {
        try {
            Todo updatedTodo = todoService.addSubtask(id, subtask);
            return ResponseEntity.ok(updatedTodo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/subtasks/{subtaskId}")
    public ResponseEntity<Todo> updateSubtask(
            @PathVariable Long id,
            @PathVariable Long subtaskId,
            @RequestParam boolean completed) {
        try {
            Todo updatedTodo = todoService.updateSubtask(id, subtaskId, completed);
            return ResponseEntity.ok(updatedTodo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/subtasks/{subtaskId}")
    public ResponseEntity<Todo> removeSubtask(
            @PathVariable Long id,
            @PathVariable Long subtaskId) {
        try {
            Todo updatedTodo = todoService.removeSubtask(id, subtaskId);
            return ResponseEntity.ok(updatedTodo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/tag/{tag}")
    public List<Todo> getTodosByTag(@PathVariable String tag) {
        return todoService.getTodosByTag(tag);
    }

    @GetMapping("/recurring")
    public List<Todo> getRecurringTodos() {
        return todoService.getRecurringTodos();
    }

    @PutMapping("/{id}/notes")
    public ResponseEntity<Todo> updateNotes(
            @PathVariable Long id,
            @RequestBody String notes) {
        try {
            Todo updatedTodo = todoService.updateNotes(id, notes);
            return ResponseEntity.ok(updatedTodo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/attachment")
    public ResponseEntity<Todo> updateAttachment(
            @PathVariable Long id,
            @RequestBody String attachmentUrl) {
        try {
            Todo updatedTodo = todoService.updateAttachment(id, attachmentUrl);
            return ResponseEntity.ok(updatedTodo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 