import React, { useState } from "react";
import "./TodoForm.css";

const TodoForm = ({ onAddTodo, categories }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const newTodo = {
      title: title.trim(),
      description: description.trim(),
      category: category || "Uncategorized",
      priority,
      dueDate: dueDate || null,
      completed: false,
    };

    onAddTodo(newTodo);
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("medium");
    setDueDate("");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="todo-input"
        />
      </div>

      <div className="form-group">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)"
          className="todo-textarea"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="todo-select"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="todo-select"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <div className="form-group">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="todo-date"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="add-todo-button">
        Add Todo
      </button>
    </form>
  );
};

export default TodoForm;
