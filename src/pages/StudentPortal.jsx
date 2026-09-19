import React, { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  BookOpen,
  ShieldCheck
} from "lucide-react";

export const StudentPortal = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStudentReport = async () => {
    try {
      const studentId = user?.student?.id || 1;
      const res = await api.getStudentReport(studentId);
      setReport(res);
    } catch (err) {
      console.error("Error loading student report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentReport();
  }, [user]);

  const percentage = report?.attendance_percentage || 0;
  const isEligible = report?.is_eligible ?? (percentage >= 75.0);

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Student Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100">{user?.full_name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Roll No: <span className="text-indigo-400 font-mono font-bold">{user?.student?.roll_number || "CS2026001"}</span>
            </p>
            <p className="text-xs text-slate-400">Department: Computer Science & Engineering | Semester 4</p>
          </div>
        </div>

        {/* Biometric Status Chip */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Biometric Template:</span>
          <span className="font-semibold text-emerald-400">Enrolled & Active</span>
        </div>
      </div>

      {/* Attendance Turnout Status & 75% Rule Alert */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Lectures</span>
          <div className="text-3xl font-black text-slate-100">{report?.total_classes || 0}</div>
          <p className="text-xs text-slate-500">Conducted curriculum sessions</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Attended Lectures</span>
          <div className="text-3xl font-black text-emerald-400">{report?.attended_classes || 0}</div>
          <p className="text-xs text-slate-500">Present & Late verifications</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Turnout Percentage</span>
          <div className={`text-3xl font-black ${isEligible ? "text-indigo-400" : "text-rose-400"}`}>
            {percentage}%
          </div>
          <p className="text-xs text-slate-500">Institutional Minimum: 75.0%</p>
        </div>
      </div>

      {/* Institutional Eligibility Alert */}
      {!isEligible ? (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <span className="font-bold">Exam Eligibility Warning:</span> Your current attendance ({percentage}%) is below the mandatory 75% collegiate threshold. Please ensure regular attendance to avoid debarment.
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <div>
            <span className="font-bold">Compliant Status:</span> Your attendance percentage satisfies institutional criteria for semester examination eligibility.
          </div>
        </div>
      )}

      {/* Session History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <span>Lecture Attendance Ledger</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Session & Course</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification Method</th>
                <th className="py-3 px-4">Marked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report?.history?.map((h) => (
                <tr key={h.record_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-xs text-slate-400 font-mono">{h.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{h.session_title}</div>
                    <div className="text-xs text-indigo-400">{h.course_name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={h.status} />
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-400">{h.method}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{h.marked_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
