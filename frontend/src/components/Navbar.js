import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Menu } from "lucide-react";
import "./Navbar.css";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="navbar-brand">
          <Link to="/">Todo App</Link>
        </div>
      </div>

      {user && (
        <>
          <div className="navbar-menu">
            <Link to="/" className="nav-link">
              Dashboard
            </Link>
            <Link to="/todos" className="nav-link">
              Todos
            </Link>
            <Link to="/categories" className="nav-link">
              Categories
            </Link>
          </div>

          <div className="navbar-end">
            <div
              className="user-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="user-name">{user.username}</span>
              <div className={`dropdown-menu ${isMenuOpen ? "show" : ""}`}>
                <Link to="/profile" className="dropdown-item">
                  Profile
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
