import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

export const LoginView = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("prof_john");
  const [password, setPassword] = useState("teacher123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your username and password.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">Apex Institute of Technology</h2>
            <p className="text-sm text-slate-400 mt-1">Real-Time Attendance Management Platform</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center space-x-2 text-xs text-rose-400 bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Platform"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Role Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center mb-3">
            Quick Demo Logins
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setDemoUser("superadmin", "admin123")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20"
            >
              Super Admin
            </button>
            <button
              onClick={() => setDemoUser("admin", "admin123")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20"
            >
              Campus Admin
            </button>
            <button
              onClick={() => setDemoUser("prof_john", "teacher123")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              Teacher (John)
            </button>
            <button
              onClick={() => setDemoUser("alice", "student123")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
            >
              Student (Alice)
            </button>
            <button
              onClick={() => setDemoUser("operator1", "operator123")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20"
            >
              Camera Operator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
