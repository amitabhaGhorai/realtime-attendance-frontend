import React, { useState } from "react";
import { api } from "../api";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export const ManualOverrideModal = ({ record, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !record) return null;

  const [newStatus, setNewStatus] = useState(record.status || "PRESENT");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 3) {
      setError("A detailed justification reason is strictly required for audit governance.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.overrideRecord(record.id, newStatus, reason.trim());
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update attendance status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Manual Attendance Correction</h3>
            <p className="text-xs text-slate-400">Audited status override workflow</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Student:</span>
              <span className="font-semibold text-slate-200">{record.student_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Roll Number:</span>
              <span className="font-mono text-slate-300">{record.roll_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Status:</span>
              <span className="font-medium text-amber-400">{record.status}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Select Corrected Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["PRESENT", "LATE", "ABSENT", "EXCUSED"].map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setNewStatus(st)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    newStatus === st
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Justification Reason <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Student presented valid medical note; camera obstruction on entrance."
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
            <p className="text-[11px] text-slate-500 mt-1">
              This note is permanently recorded in the institutional audit ledger.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-xl border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? "Recording..." : "Confirm & Save Override"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
