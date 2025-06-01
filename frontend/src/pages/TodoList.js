import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import TodoForm from "../components/TodoForm";
import TodoItem from "../components/TodoItem";
import Sidebar from "../components/Sidebar";
import "./TodoList.css";

const TodoList = () => {
  const { token } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, completed
  const [sortBy, setSortBy] = useState("createdAt"); // createdAt, dueDate, priority
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    fetchTodos();
    fetchCategories();
  }, [token]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/todos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch todos");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/todos/categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleAddTodo = async (newTodo) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/todos",
        newTodo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTodos([...todos, response.data]);
    } catch (err) {
      setError("Failed to add todo");
    }
  };

  const handleUpdateTodo = async (id, updatedTodo) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/todos/${id}`,
        updatedTodo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
    } catch (err) {
      setError("Failed to update todo");
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/todos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      setError("Failed to delete todo");
    }
  };

  const handleBulkComplete = async (ids) => {
    try {
      await Promise.all(
        ids.map((id) =>
          axios.put(
            `http://localhost:8080/api/todos/${id}`,
            { completed: true },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );
      fetchTodos();
    } catch (err) {
      setError("Failed to complete todos");
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(
        ids.map((id) =>
          axios.delete(`http://localhost:8080/api/todos/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
      setTodos(todos.filter((todo) => !ids.includes(todo.id)));
    } catch (err) {
      setError("Failed to delete todos");
    }
  };

  // Filter and sort todos
  const filteredAndSortedTodos = todos
    .filter((todo) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !todo.completed) ||
        (filter === "completed" && todo.completed);

      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || todo.category === selectedCategory;

      return matchesFilter && matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "priority":
          return b.priority - a.priority;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="todo-list-page">
      <Sidebar />
      <div className="todo-list-content">
        <h1>My Todos</h1>

        <div className="todo-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Date Created</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <label className="show-completed">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
              />
              Show Completed
            </label>
          </div>
        </div>

        <TodoForm onAddTodo={handleAddTodo} categories={categories} />

        <div className="todos-container">
          {filteredAndSortedTodos.length === 0 ? (
            <p className="no-todos">No todos found. Add one above!</p>
          ) : (
            <>
              <div className="todo-stats">
                <span>{filteredAndSortedTodos.length} todos</span>
                <span>
                  {
                    filteredAndSortedTodos.filter((todo) => todo.completed)
                      .length
                  }{" "}
                  completed
                </span>
              </div>
              {filteredAndSortedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
