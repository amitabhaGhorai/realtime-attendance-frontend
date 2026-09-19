import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("attendance_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem("attendance_user", JSON.stringify(profile));
        } catch (err) {
          console.error("Failed to load user profile:", err);
          setUser(null);
          setToken(null);
          localStorage.removeItem("attendance_token");
          localStorage.removeItem("attendance_user");
        }
      }
      setLoading(false);
    }
    loadCurrentUser();
  }, [token]);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    localStorage.setItem("attendance_token", res.access_token);
    setToken(res.access_token);
    const profile = await api.getMe();
    setUser(profile);
    localStorage.setItem("attendance_user", JSON.stringify(profile));
    return profile;
  };

  const logout = () => {
    localStorage.removeItem("attendance_token");
    localStorage.removeItem("attendance_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
