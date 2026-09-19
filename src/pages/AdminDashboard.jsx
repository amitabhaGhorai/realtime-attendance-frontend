import React, { useState, useEffect } from "react";
import { api } from "../api";
import { useWebSocket } from "../context/WebSocketContext";
import { StatusBadge } from "../components/StatusBadge";
import {
  Users,
  GraduationCap,
  Calendar,
  Cpu,
  TrendingUp,
  Settings as SettingsIcon,
  Play,
  Square,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export const AdminDashboard = ({ onNavigateToLive }) => {
  const { lastEvent } = useWebSocket();
  const [dailyStats, setDailyStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sRes, dRes, devRes, stuRes, teaRes, setRes] = await Promise.all([
        api.getDailyReport(),
        api.getSessions(),
        api.getDevices(),
        api.getStudents(),
        api.getTeachers(),
        api.getSettings(),
      ]);
      setDailyStats(sRes);
      setSessions(dRes);
      setDevices(devRes);
      setStudents(stuRes);
      setTeachers(teaRes);
      setSettings(setRes);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (lastEvent) {
      // Refresh active sessions on WebSocket attendance marked or session change
      api.getSessions().then(setSessions).catch(() => {});
      api.getDailyReport().then(setDailyStats).catch(() => {});
    }
  }, [lastEvent]);

  const onlineDevicesCount = devices.filter((d) => d.status === "ONLINE").length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Institutional Operations Center</h2>
          <p className="text-sm text-slate-400 mt-1">Campus-wide real-time biometric attendance metrics</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Data</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Students</p>
              <h3 className="text-3xl font-black text-slate-100 mt-2">{students.length}</h3>
              <p className="text-xs text-emerald-400 font-medium mt-1">
                {students.filter((s) => s.has_face_template).length} Biometrically Enrolled
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Faculty Roster</p>
              <h3 className="text-3xl font-black text-slate-100 mt-2">{teachers.length}</h3>
              <p className="text-xs text-slate-400 mt-1">Active Instructors</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today's Turnout</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-2">
                {dailyStats?.attendance_rate || 0}%
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {dailyStats?.present_count || 0} Present / {dailyStats?.total_records || 0} Records
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Camera Fleet</p>
              <h3 className="text-3xl font-black text-slate-100 mt-2">
                {onlineDevicesCount} / {devices.length}
              </h3>
              <p className="text-xs text-emerald-400 font-medium mt-1">Online & Streaming</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions & System Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Class Sessions */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-100">Live & Scheduled Sessions</h3>
            <span className="text-xs text-slate-400">{sessions.length} total sessions today</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Session Title</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200">{sess.title}</td>
                    <td className="py-3 px-4 text-xs font-mono text-indigo-400">{sess.course_name}</td>
                    <td className="py-3 px-4 text-xs">{sess.room_number || "Lab 401"}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={sess.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sess.status === "ACTIVE" && (
                        <button
                          onClick={() => onNavigateToLive(sess.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Monitor HUD</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Settings Preview */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-100">Recognition Rules</h3>
          </div>

          <div className="space-y-4 text-sm">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
              <span className="text-xs text-slate-400">Grace Period (Present threshold)</span>
              <div className="text-lg font-bold text-slate-100">
                {settings?.default_grace_period_minutes || 10} Minutes
              </div>
              <p className="text-[11px] text-slate-500">Students arriving after grace window are marked Late.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
              <span className="text-xs text-slate-400">Face Match Confidence Threshold</span>
              <div className="text-lg font-bold text-indigo-400">
                {settings?.default_confidence_threshold || 0.65} Cosine
              </div>
              <p className="text-[11px] text-slate-500">Scans below threshold trigger manual verification.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
              <span className="text-xs text-slate-400">Laplacian Sharpness Check</span>
              <div className="text-lg font-bold text-emerald-400">
                &ge; {settings?.laplacian_sharpness_threshold || 60.0}
              </div>
              <p className="text-[11px] text-slate-500">Rejects blurry frames before recognition.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
