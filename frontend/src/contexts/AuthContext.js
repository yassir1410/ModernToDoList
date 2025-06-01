import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      console.log(
          "Initializing auth with stored token:",
          storedToken ? "exists" : "none"
      );

      if (storedToken) {
        try {
          // Set default authorization header
          axios.defaults.headers.common[
              "Authorization"
              ] = `Bearer ${storedToken}`;
          console.log("Set authorization header with token");

          // Fetch user data
          console.log("Fetching user data...");
          const response = await axios.get("http://localhost:8080/api/auth/me");
          console.log("User data received:", response.data);

          setUser(response.data);
          setToken(storedToken);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error fetching user:", error);
          if (error.response) {
            console.error("Error response:", error.response.data);
            console.error("Error status:", error.response.status);
          }
          // Clear invalid token
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      console.log("Attempting login for user:", username);
      const response = await axios.post(
          "http://localhost:8080/api/auth/login",
          {
            username,
            password,
          }
      );
      console.log("Login response:", response.data);

      // Extract token and user data from response
      const { token: newToken, user: userData } = response.data;

      if (!newToken || !userData) {
        console.error("Invalid response data:", response.data);
        throw new Error("Invalid response from server");
      }

      // Set token in localStorage and axios headers
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      console.log("Token stored and headers set");

      // Update state
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      console.log("Auth state updated");

      return true;
    } catch (error) {
      console.error("Login error:", error);
      // Clear any existing invalid state
      logout();

      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        // Return the specific error message from backend
        const errorMessage = error.response.data?.message ||
            (typeof error.response.data === 'string' ? error.response.data : 'Login failed');
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("Unable to connect to server. Please check your connection.");
      } else {
        throw new Error(error.message || "An unexpected error occurred");
      }
    }
  };

  const register = async (registrationData) => {
    try {
      console.log("Attempting registration for user:", registrationData.username);
      const response = await axios.post(
          "http://localhost:8080/api/auth/register",
          registrationData
      );
      console.log("Registration response:", response.data);

      // Fixed: Use different variable name to avoid conflict
      const { token: newToken, user: newUser } = response.data;

      if (!newToken || !newUser) {
        console.error("Invalid response data:", response.data);
        throw new Error("Invalid response from server");
      }

      // Set token in localStorage and axios headers
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      console.log("Token stored and headers set");

      // Update state
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      console.log("Auth state updated");

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      // Clear any existing invalid state
      logout();

      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        const errorMessage = error.response.data?.message ||
            (typeof error.response.data === 'string' ? error.response.data : 'Registration failed');
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("Unable to connect to server. Please check your connection.");
      } else {
        throw new Error(error.message || "An unexpected error occurred");
      }
    }
  };

  const logout = () => {
    console.log("Logging out...");
    // Clear token from localStorage and axios headers
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    console.log("Token and headers cleared");

    // Reset state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log("Auth state reset");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
      <AuthContext.Provider
          value={{
            user,
            token,
            isAuthenticated,
            login,
            register,
            logout,
            loading, // Expose loading state
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};