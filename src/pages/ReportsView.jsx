import React, { useState, useEffect } from "react";
import { api } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export const ReportsView = () => {
  const [dailyStats, setDailyStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [dRes, sRes] = await Promise.all([
        api.getDailyReport(),
        api.getSessions(),
      ]);
      setDailyStats(dRes);
      setSessions(sRes);
      if (sRes.length > 0) {
        setSelectedSessionId(sRes[0].id);
        const recRes = await api.getSessionRecords(sRes[0].id);
        setRecords(recRes);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSessionChange = async (id) => {
    setSelectedSessionId(id);
    if (!id) {
      setRecords([]);
      return;
    }
    try {
      const res = await api.getSessionRecords(id);
      setRecords(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Institutional Attendance Reports</h2>
          <p className="text-sm text-slate-400 mt-1">Export verified attendance records and compliance audits</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => api.downloadCSV(selectedSessionId || undefined)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => api.downloadPDF(selectedSessionId || undefined)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Official PDF</span>
          </button>
        </div>
      </div>

      {/* Daily Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Records</span>
          <div className="text-2xl font-black text-slate-100 mt-1">{dailyStats?.total_records || 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-emerald-400">Present</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{dailyStats?.present_count || 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-amber-400">Late</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{dailyStats?.late_count || 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-indigo-400">Turnout Rate</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{dailyStats?.attendance_rate || 0}%</div>
        </div>
      </div>

      {/* Session Filter */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Class Session:</span>
        <select
          value={selectedSessionId}
          onChange={(e) => handleSessionChange(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 flex-1 max-w-md"
        >
          <option value="">All Sessions Combined</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.date} - {s.status})
            </option>
          ))}
        </select>
      </div>

      {/* Records Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Roll Number</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Verification Method</th>
              <th className="py-3 px-4">Confidence / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-mono text-xs font-bold text-slate-300">{r.roll_number}</td>
                <td className="py-3 px-4 font-semibold text-slate-100">{r.student_name}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="py-3 px-4 text-xs font-mono text-slate-400">
                  {new Date(r.marked_at).toLocaleTimeString()}
                </td>
                <td className="py-3 px-4 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
                    {r.verification_method}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-slate-400">
                  {r.confidence_score ? `${Math.round(r.confidence_score * 100)}% Match` : r.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
