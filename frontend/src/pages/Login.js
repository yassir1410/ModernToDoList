import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log("Testing backend connection...");
      const response = await axios.get("http://localhost:8080/api/auth/me");
      console.log("Backend connection test - Success:", response.data);
      setDebugInfo("✅ Backend is reachable");
    } catch (error) {
      console.log("Backend connection test - Error:", error);
      if (error.code === 'ERR_NETWORK') {
        setDebugInfo("❌ Backend not reachable - Check if server is running on port 8080");
      } else if (error.response?.status === 401) {
        setDebugInfo("✅ Backend is reachable (401 expected without token)");
      } else {
        setDebugInfo(`⚠️ Backend response: ${error.response?.status || 'Unknown error'}`);
      }
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      setError("");
    }
  };

  // Direct API test (bypassing AuthContext)
  const testDirectLogin = async () => {
    console.log("=== DIRECT LOGIN TEST ===");
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        username: credentials.username,
        password: credentials.password,
      });

      console.log("Direct login SUCCESS:", response.data);
      setDebugInfo(`✅ Direct API call successful! Token received: ${response.data.token?.substring(0, 20)}...`);

      // Try to store token and test /me endpoint
      localStorage.setItem("token", response.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

      const meResponse = await axios.get("http://localhost:8080/api/auth/me");
      console.log("Direct /me call SUCCESS:", meResponse.data);
      setDebugInfo(prev => prev + `\n✅ /me endpoint works! User: ${meResponse.data.username}`);

    } catch (error) {
      console.log("Direct login ERROR:", error);
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error status:", error.response.status);
        setDebugInfo(`❌ Direct API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        setDebugInfo(`❌ Network error: ${error.message}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setError("");
    setLoading(true);
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Username:", credentials.username);
    console.log("Password length:", credentials.password.length);

    try {
      console.log("Calling AuthContext login...");
      const result = await login(credentials.username.trim(), credentials.password);
      console.log("AuthContext login result:", result);

      if (result === true) {
        console.log("Login successful!");
        setDebugInfo("✅ Login successful via AuthContext");
      } else {
        console.log("Login failed - result was:", result);
        setError("Login failed. Unexpected result from login function.");
        setDebugInfo(`❌ Login failed - result: ${result}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error.constructor.name);

      setError(error.message || "Login failed");
      setDebugInfo(`❌ AuthContext error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="login-page">
        <div className="login-container">
          <h1>Login - Debug Mode</h1>

          {/* Debug Info Panel */}
          <div style={{
            background: '#f5f5f5',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-line'
          }}>
            <strong>Debug Info:</strong><br />
            {debugInfo || "Initializing..."}
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username"
                  disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  disabled={loading}
              />
            </div>

            {/* Debug buttons */}
            <div style={{ margin: '10px 0' }}>
              <button
                  type="button"
                  onClick={testDirectLogin}
                  disabled={loading || !credentials.username.trim() || !credentials.password.trim()}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    marginRight: '10px',
                    borderRadius: '3px'
                  }}
              >
                Test Direct API Call
              </button>
              <button
                  type="button"
                  onClick={testBackendConnection}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '3px'
                  }}
              >
                Test Backend Connection
              </button>
            </div>

            <button
                type="submit"
                className="login-button"
                disabled={loading || !credentials.username.trim() || !credentials.password.trim()}
            >
              {loading ? "Logging in..." : "Login via AuthContext"}
            </button>
          </form>

          <p className="register-link">
            Don't have an account?{" "}
            <a
                href="/register"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
            >
              Register here
            </a>
          </p>
        </div>
      </div>
  );
};

export default Login;