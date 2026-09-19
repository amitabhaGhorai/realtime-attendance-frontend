import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Camera,
  Users,
  BookOpen,
  CalendarCheck,
  FileText,
  Cpu,
  ShieldAlert,
  GraduationCap
} from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const role = user?.role || "STUDENT";

  const allItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
    { id: "student-portal", label: "My Attendance", icon: GraduationCap, roles: ["STUDENT"] },
    { id: "live", label: "Live Camera HUD", icon: Camera, roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "DEVICE_OPERATOR"] },
    { id: "students", label: "Students & Biometrics", icon: Users, roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
    { id: "academic", label: "Academic Hierarchy", icon: BookOpen, roles: ["SUPER_ADMIN", "ADMIN"] },
    { id: "reports", label: "Attendance Reports", icon: FileText, roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
    { id: "devices", label: "Camera Fleet", icon: Cpu, roles: ["SUPER_ADMIN", "ADMIN", "DEVICE_OPERATOR"] },
    { id: "audit", label: "Audit & Security Logs", icon: ShieldAlert, roles: ["SUPER_ADMIN", "ADMIN"] },
  ];

  const visibleItems = allItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">System v1.0.0</div>
          <div>YuNet + SFace Cosine Matching</div>
          <div className="text-[11px] text-indigo-400 font-mono">SQLite + FastAPI Backend</div>
        </div>
      </div>
    </aside>
  );
};
