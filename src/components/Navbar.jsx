import React from "react";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import { LogOut, User as UserIcon, Shield, Radio } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { status } = useWebSocket();

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "ADMIN":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "TEACHER":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "STUDENT":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "DEVICE_OPERATOR":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 tracking-tight leading-tight">Apex Institute of Technology</h1>
          <p className="text-xs text-slate-400">Real-Time Smart Attendance Platform</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* WebSocket Health Monitor */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
          <Radio className={`w-3.5 h-3.5 ${status === "CONNECTED" ? "text-emerald-400 animate-pulse" : "text-rose-400"}`} />
          <span className="text-slate-400">Live Stream:</span>
          <span className={`font-semibold ${status === "CONNECTED" ? "text-emerald-400" : "text-rose-400"}`}>
            {status}
          </span>
        </div>

        {/* User Info & Role */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-200">{user?.full_name || "User"}</div>
            <span className={`inline-block px-2 py-0.2 rounded text-[10px] uppercase font-bold border ${getRoleBadge(user?.role)}`}>
              {user?.role?.replace("_", " ")}
            </span>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
