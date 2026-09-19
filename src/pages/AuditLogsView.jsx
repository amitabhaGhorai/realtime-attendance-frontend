import React, { useState, useEffect } from "react";
import { api } from "../api";
import { ShieldAlert, RefreshCw, Filter } from "lucide-react";

export const AuditLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const res = await api.getAuditLogs(actionFilter || undefined);
      setLogs(res);
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Security & Governance Audit Ledger</h2>
          <p className="text-sm text-slate-400 mt-1">Immutable trail of manual attendance corrections and biometric operations</p>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-400 uppercase">Filter Action:</span>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Actions</option>
          <option value="MANUAL_ATTENDANCE_OVERRIDE">Manual Attendance Override</option>
          <option value="FACE_ENROLLMENT">Face Enrollment</option>
          <option value="BIOMETRIC_REVOKED_AND_DELETED">Biometric Revoked & Purged</option>
          <option value="SYSTEM_INIT">System Initialization</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Mutation Diff</th>
              <th className="py-3 px-4">Justification Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-100">{log.user_name || "System"}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs font-mono text-slate-400">{log.entity_type}</td>
                <td className="py-3 px-4 text-xs">
                  {log.old_state && <span className="text-slate-500 line-through mr-1">{log.old_state}</span>}
                  {log.new_state && <span className="text-emerald-400 font-semibold">{log.new_state}</span>}
                </td>
                <td className="py-3 px-4 text-xs text-amber-300 font-medium">{log.reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
