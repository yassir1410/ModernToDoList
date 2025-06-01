import React, { useState } from "react";
import "./TodoItem.css";

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description);
  const [editedCategory, setEditedCategory] = useState(todo.category);
  const [editedPriority, setEditedPriority] = useState(todo.priority);
  const [editedDueDate, setEditedDueDate] = useState(todo.dueDate || "");

  const handleToggleComplete = () => {
    onUpdate(todo.id, { ...todo, completed: !todo.completed });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(todo.id, {
      ...todo,
      title: editedTitle,
      description: editedDescription,
      category: editedCategory,
      priority: editedPriority,
      dueDate: editedDueDate || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(todo.title);
    setEditedDescription(todo.description);
    setEditedCategory(todo.category);
    setEditedPriority(todo.priority);
    setEditedDueDate(todo.dueDate || "");
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      try {
        await onDelete(todo.id);
      } catch (error) {
        console.error("Error deleting todo:", error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue =
    todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  if (isEditing) {
    return (
      <div className="todo-item editing">
        <div className="todo-item-content">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="edit-input"
            placeholder="Todo title"
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="edit-textarea"
            placeholder="Todo description"
          />
          <div className="edit-fields">
            <select
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
              className="edit-select"
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Shopping">Shopping</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={editedPriority}
              onChange={(e) => setEditedPriority(e.target.value)}
              className="edit-select"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input
              type="date"
              value={editedDueDate}
              onChange={(e) => setEditedDueDate(e.target.value)}
              className="edit-date"
            />
          </div>
        </div>
        <div className="todo-item-actions">
          <button onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
          <button onClick={handleSave} className="save-button">
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`todo-item ${todo.completed ? "completed" : ""} ${
        isOverdue ? "overdue" : ""
      }`}
    >
      <div className="todo-item-content">
        <div className="todo-header">
          <div className="todo-title-container">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggleComplete}
              className="todo-checkbox"
            />
            <h3 className="todo-title">{todo.title}</h3>
          </div>
          <div className="todo-meta">
            <span
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(todo.priority) }}
            >
              {todo.priority}
            </span>
            <span className="category-badge">{todo.category}</span>
          </div>
        </div>
        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}
        <div className="todo-footer">
          <span className={`due-date ${isOverdue ? "overdue" : ""}`}>
            {formatDate(todo.dueDate)}
          </span>
          <div className="todo-actions">
            <button onClick={handleEdit} className="edit-button">
              Edit
            </button>
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
