package com.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "todos")
@Data
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    private boolean completed;
    
    private String category;
    private LocalDateTime dueDate;
    private Priority priority;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ElementCollection
    private Set<String> tags = new HashSet<>();
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Subtask> subtasks = new HashSet<>();
    
    private String notes;
    private String attachmentUrl;
    private int progress;
    
    @Enumerated(EnumType.STRING)
    private RecurrenceType recurrenceType;
    private LocalDateTime recurrenceEndDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Priority {
        LOW, MEDIUM, HIGH
    }
    
    public enum RecurrenceType {
        NONE, DAILY, WEEKLY, MONTHLY, YEARLY
    }
    
    @Entity
    @Data
    public static class Subtask {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        
        private String title;
        private boolean completed;
    }
} 