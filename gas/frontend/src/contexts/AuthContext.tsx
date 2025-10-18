import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role?: string;
  clearanceLevel?: number;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("gasguard-user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("gasguard-token") || null;
  });

  const isAuthenticated = !!user && !!token;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post("http://localhost:5000/auth/login", { email, password });
      const data = res.data;

      if (data?.token && data?.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("gasguard-user", JSON.stringify(data.user));
        localStorage.setItem("gasguard-token", data.token);
        return true;
      }

      console.warn("Login failed: no token or user returned");
      return false;
    } catch (err: any) {
      if (err.response) {
        console.error("Login error:", err.response.data);
      } else {
        console.error("Login error:", err.message);
      }
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post("http://localhost:5000/auth/signup", { name, email, password });
      const data = res.data;

      if (data?.token && data?.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("gasguard-user", JSON.stringify(data.user));
        localStorage.setItem("gasguard-token", data.token);
        return true;
      }

      console.warn("Signup failed: no token or user returned");
      return false;
    } catch (err: any) {
      if (err.response) {
        console.error("Signup error:", err.response.data);
      } else {
        console.error("Signup error:", err.message);
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("gasguard-user");
    localStorage.removeItem("gasguard-token");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, isAuthenticated, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
