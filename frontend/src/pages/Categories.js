import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import "./Categories.css";

const Categories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchCategories();
  }, [token]);

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
      setLoading(false);
    } catch (err) {
      setError("Failed to load categories");
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await axios.post(
        "http://localhost:8080/api/todos/categories",
        { name: newCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({
        type: "success",
        text: "Category added successfully",
      });
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to add category",
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/todos/categories/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({
        type: "success",
        text: "Category deleted successfully",
      });
      fetchCategories();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete category",
      });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="categories">
      <h1>Todo Categories</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleAddCategory} className="category-form">
        <div className="form-group">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter new category name"
            required
          />
          <button type="submit" className="add-button">
            Add Category
          </button>
        </div>
      </form>

      <div className="category-list">
        {categories.map((category) => (
          <div key={category.id} className="category-item">
            <div className="category-info">
              <h3>{category.name}</h3>
              <span className="todo-count">{category.todoCount} todos</span>
            </div>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="delete-button"
              disabled={category.todoCount > 0}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
