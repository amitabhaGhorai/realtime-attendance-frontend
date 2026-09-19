import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { LoginView } from "./pages/LoginView";
import { AdminDashboard } from "./pages/AdminDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { LiveAttendanceView } from "./pages/LiveAttendanceView";
import { StudentsView } from "./pages/StudentsView";
import { AcademicView } from "./pages/AcademicView";
import { ReportsView } from "./pages/ReportsView";
import { DevicesView } from "./pages/DevicesView";
import { AuditLogsView } from "./pages/AuditLogsView";
import { StudentPortal } from "./pages/StudentPortal";

export function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedLiveSession, setSelectedLiveSession] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const role = user.role;

  // Determine initial tab for role if current is inaccessible
  const renderContent = () => {
    if (role === "STUDENT") {
      return <StudentPortal />;
    }

    if (role === "DEVICE_OPERATOR") {
      if (activeTab === "devices") return <DevicesView />;
      return <LiveAttendanceView initialSessionId={selectedLiveSession} />;
    }

    switch (activeTab) {
      case "dashboard":
        if (role === "TEACHER") {
          return (
            <TeacherDashboard
              onNavigateToLive={(sessionId) => {
                setSelectedLiveSession(sessionId);
                setActiveTab("live");
              }}
            />
          );
        }
        return (
          <AdminDashboard
            onNavigateToLive={(sessionId) => {
              setSelectedLiveSession(sessionId);
              setActiveTab("live");
            }}
          />
        );
      case "live":
        return <LiveAttendanceView initialSessionId={selectedLiveSession} />;
      case "students":
        return <StudentsView />;
      case "academic":
        return <AcademicView />;
      case "reports":
        return <ReportsView />;
      case "devices":
        return <DevicesView />;
      case "audit":
        return <AuditLogsView />;
      default:
        return role === "TEACHER" ? <TeacherDashboard /> : <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto bg-slate-950">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
