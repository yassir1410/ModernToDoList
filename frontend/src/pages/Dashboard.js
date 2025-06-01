import React, { useState, useEffect } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  AlertCircle,
  TrendingUp,
  Users,
  Settings,
  Bell,
  Home,
  List,
  Target,
  Archive,
  Menu,
  X,
  Edit3,
  Trash2,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import "./Dashboard.css";

// Mock API functions (replace with actual API calls)
const mockApi = {
  async getDashboardData() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      stats: {
        total: 24,
        completed: 16,
        pending: 8,
        byCategory: {
          Work: 12,
          Personal: 8,
          Shopping: 4,
        },
      },
      recentTodos: [
        {
          id: 1,
          title: "Complete project proposal",
          description: "Finish the Q4 project proposal document",
          category: "Work",
          completed: false,
          priority: "HIGH",
          dueDate: "2025-06-05",
        },
        {
          id: 2,
          title: "Buy groceries",
          description: "Weekly grocery shopping",
          category: "Personal",
          completed: true,
          priority: "MEDIUM",
          dueDate: "2025-06-02",
        },
        {
          id: 3,
          title: "Review code changes",
          description: "Review PR #234 for the new feature",
          category: "Work",
          completed: false,
          priority: "HIGH",
          dueDate: "2025-06-03",
        },
      ],
    };
  },

  async getTodos() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: 1,
        title: "Complete project proposal",
        description: "Finish the Q4 project proposal document",
        category: "Work",
        completed: false,
        priority: "HIGH",
        dueDate: "2025-06-05",
        tags: ["urgent", "project"],
      },
      {
        id: 2,
        title: "Buy groceries",
        description: "Weekly grocery shopping",
        category: "Personal",
        completed: true,
        priority: "MEDIUM",
        dueDate: "2025-06-02",
        tags: ["shopping"],
      },
      {
        id: 3,
        title: "Review code changes",
        description: "Review PR #234 for the new feature",
        category: "Work",
        completed: false,
        priority: "HIGH",
        dueDate: "2025-06-03",
        tags: ["code-review"],
      },
      {
        id: 4,
        title: "Plan vacation",
        description: "Research and book summer vacation",
        category: "Personal",
        completed: false,
        priority: "LOW",
        dueDate: "2025-06-15",
        tags: ["vacation", "planning"],
      },
      {
        id: 5,
        title: "Team meeting prep",
        description: "Prepare agenda for weekly team meeting",
        category: "Work",
        completed: false,
        priority: "MEDIUM",
        dueDate: "2025-06-04",
        tags: ["meeting"],
      },
    ];
  },

  async getOverdueTodos() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: 6,
        title: "Submit expense report",
        description: "Monthly expense report submission",
        category: "Work",
        completed: false,
        priority: "HIGH",
        dueDate: "2025-05-30",
      },
      {
        id: 7,
        title: "Car maintenance",
        description: "Schedule car service appointment",
        category: "Personal",
        completed: false,
        priority: "MEDIUM",
        dueDate: "2025-05-28",
      },
    ];
  },
};

// Sidebar Component
const Sidebar = ({
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "todos", label: "All Todos", icon: List },
    { id: "completed", label: "Completed", icon: CheckCircle2 },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "overdue", label: "Overdue", icon: Target },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "archive", label: "Archive", icon: Archive },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">TodoApp</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors ${
                  activeView === item.id
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

// Header Component
const Header = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search todos..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Dashboard View
const DashboardView = ({ dashboardData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { stats, recentTodos } = dashboardData;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your todos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Todos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <List className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.completed}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.pending}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Todos */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Todos
            </h2>
          </div>
          <div className="p-6">
            {recentTodos.length > 0 ? (
              <div className="space-y-4">
                {recentTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        todo.completed ? "bg-green-500" : "bg-orange-500"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          todo.completed
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {todo.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {todo.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {todo.category}
                        </span>
                        {todo.priority && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              todo.priority === "HIGH"
                                ? "bg-red-100 text-red-800"
                                : todo.priority === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {todo.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent todos</p>
            )}
          </div>
        </div>

        {/* Category Stats */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">By Category</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {category}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Todo List View
const TodoListView = ({ todos, loading, onToggleComplete, onDelete }) => {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "pending") return !todo.completed;
    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === "dueDate") return new Date(a.dueDate) - new Date(b.dueDate);
    if (sortBy === "priority") {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Todos</h1>
          <p className="text-gray-600">Manage and track your todos</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Todo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Todo List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {sortedTodos.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedTodos.map((todo) => (
              <div key={todo.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => onToggleComplete(todo.id)}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      todo.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-500"
                    }`}
                  >
                    {todo.completed && <CheckCircle2 className="w-3 h-3" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-medium ${
                        todo.completed
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {todo.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {todo.description}
                    </p>

                    <div className="flex items-center mt-3 space-x-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {todo.category}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          todo.priority === "HIGH"
                            ? "bg-red-100 text-red-800"
                            : todo.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {todo.priority}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(todo.dueDate).toLocaleDateString()}
                      </div>
                      {todo.tags && (
                        <div className="flex items-center space-x-1">
                          {todo.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(todo.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No todos found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Overdue View
const OverdueView = ({ overdueTodos, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Overdue Todos</h1>
        <p className="text-gray-600">These todos are past their due date</p>
      </div>

      {overdueTodos.length > 0 ? (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm">
          <div className="divide-y divide-red-100">
            {overdueTodos.map((todo) => (
              <div key={todo.id} className="p-4 bg-red-50">
                <div className="flex items-start space-x-4">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {todo.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {todo.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-red-600 font-medium">
                        Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {todo.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">
            No overdue todos! Great job staying on track.
          </p>
        </div>
      )}
    </div>
  );
};

// Analytics View
const AnalyticsView = ({ dashboardData }) => {
  const { stats } = dashboardData;
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Insights into your productivity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Completion Rate
            </h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {completionRate}%
          </div>
          <p className="text-sm text-gray-600">Of all todos completed</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Most Active Category
            </h3>
            <Tag className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {Object.entries(stats.byCategory).sort(
              ([, a], [, b]) => b - a
            )[0]?.[0] || "None"}
          </div>
          <p className="text-sm text-gray-600">
            {Object.entries(stats.byCategory).sort(
              ([, a], [, b]) => b - a
            )[0]?.[1] || 0}{" "}
            todos
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Productivity Score
            </h3>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.min(100, Math.round(completionRate * 1.2))}
          </div>
          <p className="text-sm text-gray-600">Based on completion rate</p>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const ModernTodoDashboard = () => {
  const { token } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total: 0,
      completed: 0,
      pending: 0,
      byCategory: {},
    },
    recentTodos: [],
  });
  const [todos, setTodos] = useState([]);
  const [overdueTodos, setOverdueTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch todos to calculate stats
        const todosResponse = await axios.get(
          "http://localhost:8080/api/todos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const todos = todosResponse.data;

        // Calculate stats
        const stats = {
          total: todos.length,
          completed: todos.filter((todo) => todo.completed).length,
          pending: todos.filter((todo) => !todo.completed).length,
          byCategory: todos.reduce((acc, todo) => {
            acc[todo.category] = (acc[todo.category] || 0) + 1;
            return acc;
          }, {}),
        };

        // Get recent todos (last 5)
        const recentTodos = todos
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // Get overdue todos
        const today = new Date();
        const overdue = todos.filter(
          (todo) => !todo.completed && new Date(todo.dueDate) < today
        );

        setDashboardData({ stats, recentTodos });
        setTodos(todos);
        setOverdueTodos(overdue);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const handleToggleComplete = (todoId) => {
    setTodos(
      todos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDelete = (todoId) => {
    setTodos(todos.filter((todo) => todo.id !== todoId));
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardView dashboardData={dashboardData} loading={loading} />
        );
      case "todos":
        return (
          <TodoListView
            todos={todos}
            loading={loading}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        );
      case "completed":
        return (
          <TodoListView
            todos={todos.filter((t) => t.completed)}
            loading={loading}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        );
      case "pending":
        return (
          <TodoListView
            todos={todos.filter((t) => !t.completed)}
            loading={loading}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        );
      case "overdue":
        return <OverdueView overdueTodos={overdueTodos} loading={loading} />;
      case "analytics":
        return <AnalyticsView dashboardData={dashboardData} />;
      default:
        return (
          <DashboardView dashboardData={dashboardData} loading={loading} />
        );
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto">{renderView()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
