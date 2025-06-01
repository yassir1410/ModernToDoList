package com.todo.service;

import com.todo.model.Todo;
import com.todo.model.User;
import com.todo.repository.TodoRepository;
import com.todo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class TodoService {
    private static final Logger logger = LoggerFactory.getLogger(TodoService.class);

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    @Autowired
    public TodoService(TodoRepository todoRepository, UserRepository userRepository) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }

    public List<Todo> getAllTodos() {
        return todoRepository.findAll();
    }
    
    public Optional<Todo> getTodoById(Long id) {
        return todoRepository.findById(id);
    }
    
    public Todo createTodo(Todo todo, String username) {
        logger.info("Creating todo for user: {}", username);
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        todo.setUser(user);
        todo.setCreatedAt(LocalDateTime.now());
        todo.setUpdatedAt(LocalDateTime.now());
        todo.setProgress(0);
        if (todo.getRecurrenceType() == null) {
            todo.setRecurrenceType(Todo.RecurrenceType.NONE);
        }
        return todoRepository.save(todo);
    }
    
    public Todo updateTodo(Long id, Todo todoDetails, String username) {
        logger.info("Updating todo {} for user: {}", id, username);
        Todo todo = todoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Todo not found"));
        
        // Verify ownership
        if (!todo.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to update this todo");
        }
        
        todo.setTitle(todoDetails.getTitle());
        todo.setDescription(todoDetails.getDescription());
        todo.setCompleted(todoDetails.isCompleted());
        todo.setCategory(todoDetails.getCategory());
        todo.setDueDate(todoDetails.getDueDate());
        todo.setPriority(todoDetails.getPriority());
        todo.setTags(todoDetails.getTags());
        todo.setNotes(todoDetails.getNotes());
        todo.setAttachmentUrl(todoDetails.getAttachmentUrl());
        todo.setRecurrenceType(todoDetails.getRecurrenceType());
        todo.setRecurrenceEndDate(todoDetails.getRecurrenceEndDate());
        todo.setUpdatedAt(LocalDateTime.now());
        
        return todoRepository.save(todo);
    }
    
    public void deleteTodo(Long id, String username) {
        logger.info("Deleting todo {} for user: {}", id, username);
        Todo todo = todoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Todo not found"));
        
        // Verify ownership
        if (!todo.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to delete this todo");
        }
        
        todoRepository.delete(todo);
    }

    public List<Todo> getTodosByCategory(String category) {
        return todoRepository.findByCategory(category);
    }

    public List<Todo> getTodosByPriority(Todo.Priority priority) {
        return todoRepository.findByPriority(priority);
    }

    public List<Todo> getOverdueTodos() {
        return todoRepository.findByDueDateBeforeAndCompletedFalse(LocalDateTime.now());
    }

    public List<Todo> searchTodos(String query) {
        return todoRepository.findByTitleContainingOrDescriptionContaining(query, query);
    }

    public Todo addSubtask(Long todoId, Todo.Subtask subtask) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        todo.getSubtasks().add(subtask);
        updateProgress(todo);
        return todoRepository.save(todo);
    }

    public Todo updateSubtask(Long todoId, Long subtaskId, boolean completed) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        
        todo.getSubtasks().stream()
                .filter(subtask -> subtask.getId().equals(subtaskId))
                .findFirst()
                .ifPresent(subtask -> subtask.setCompleted(completed));
        
        updateProgress(todo);
        return todoRepository.save(todo);
    }

    public Todo removeSubtask(Long todoId, Long subtaskId) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        
        todo.getSubtasks().removeIf(subtask -> subtask.getId().equals(subtaskId));
        updateProgress(todo);
        return todoRepository.save(todo);
    }

    private void updateProgress(Todo todo) {
        if (todo.getSubtasks().isEmpty()) {
            todo.setProgress(todo.isCompleted() ? 100 : 0);
        } else {
            long completedSubtasks = todo.getSubtasks().stream()
                    .filter(Todo.Subtask::isCompleted)
                    .count();
            todo.setProgress((int) ((completedSubtasks * 100) / todo.getSubtasks().size()));
        }
    }

    public List<Todo> getTodosByTag(String tag) {
        return todoRepository.findByTagsContaining(tag);
    }

    public List<Todo> getRecurringTodos() {
        return todoRepository.findByRecurrenceTypeNot(Todo.RecurrenceType.NONE);
    }

    public Todo updateNotes(Long id, String notes) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        todo.setNotes(notes);
        todo.setUpdatedAt(LocalDateTime.now());
        return todoRepository.save(todo);
    }

    public Todo updateAttachment(Long id, String attachmentUrl) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        todo.setAttachmentUrl(attachmentUrl);
        todo.setUpdatedAt(LocalDateTime.now());
        return todoRepository.save(todo);
    }

    public List<Todo> findByUser(User user) {
        return todoRepository.findByUser(user);
    }

    public Todo findByIdAndUser(Long id, User user) {
        return todoRepository.findById(id)
                .filter(todo -> todo.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id));
    }

    @Transactional
    public Todo save(Todo todo) {
        return todoRepository.save(todo);
    }

    @Transactional
    public void deleteByIdAndUser(Long id, User user) {
        Todo todo = findByIdAndUser(id, user);
        todoRepository.delete(todo);
    }

    public List<Todo> findByUserAndCompleted(User user, boolean completed) {
        return todoRepository.findByUserAndCompleted(user, completed);
    }

    public List<Todo> getTodosByUsername(String username) {
        logger.info("Fetching todos for user: {}", username);
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return todoRepository.findByUserOrderByCreatedAtDesc(user);
    }
} 