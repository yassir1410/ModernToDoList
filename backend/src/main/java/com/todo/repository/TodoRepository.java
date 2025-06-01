package com.todo.repository;

import com.todo.model.Todo;
import com.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByUser(User user);
    List<Todo> findByUserOrderByCreatedAtDesc(User user);
    List<Todo> findByUserAndCompleted(User user, boolean completed);
    void deleteByUser(User user);
    List<Todo> findByCategory(String category);
    List<Todo> findByPriority(Todo.Priority priority);
    List<Todo> findByDueDateBeforeAndCompletedFalse(LocalDateTime date);
    
    @Query("SELECT t FROM Todo t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Todo> findByTitleContainingOrDescriptionContaining(@Param("query") String query, @Param("query") String query2);
    
    @Query("SELECT t FROM Todo t JOIN t.tags tag WHERE tag = :tag")
    List<Todo> findByTagsContaining(@Param("tag") String tag);
    
    List<Todo> findByRecurrenceTypeNot(Todo.RecurrenceType recurrenceType);
} 