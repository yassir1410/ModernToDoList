import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  List,
  CheckCircle2,
  Clock,
  Target,
  Tag,
  BarChart3,
  Archive,
  Settings,
  User,
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
    { id: "todos", label: "All Todos", icon: List, path: "/todos" },
    {
      id: "completed",
      label: "Completed",
      icon: CheckCircle2,
      path: "/completed",
    },
    { id: "pending", label: "Pending", icon: Clock, path: "/pending" },
    { id: "overdue", label: "Overdue", icon: Target, path: "/overdue" },
    { id: "categories", label: "Categories", icon: Tag, path: "/categories" },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    { id: "archive", label: "Archive", icon: Archive, path: "/archive" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>TodoApp</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-link ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="sidebar-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
