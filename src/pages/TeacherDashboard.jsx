import React, { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import { StatusBadge } from "../components/StatusBadge";
import {
  Calendar,
  PlusCircle,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Camera,
  BookOpen,
  X
} from "lucide-react";

export const TeacherDashboard = ({ onNavigateToLive }) => {
  const { user } = useAuth();
  const { lastEvent } = useWebSocket();
  const [sessions, setSessions] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // New session modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [offeringId, setOfferingId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [graceMinutes, setGraceMinutes] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const teacherId = user?.teacher?.id;
      const [sessRes, offRes, roomRes] = await Promise.all([
        api.getSessions(teacherId ? { teacherId } : {}),
        api.getOfferings(teacherId),
        api.getRooms(),
      ]);
      setSessions(sessRes);
      setOfferings(offRes);
      setRooms(roomRes);
      if (offRes.length > 0) setOfferingId(offRes[0].id);
      if (roomRes.length > 0) setRoomId(roomRes[0].id);
    } catch (err) {
      console.error("Error loading teacher dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (lastEvent) {
      const teacherId = user?.teacher?.id;
      api.getSessions(teacherId ? { teacherId } : {}).then(setSessions).catch(() => {});
    }
  }, [lastEvent]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!offeringId || !roomId || !title) return;

    setSubmitting(true);
    try {
      await api.createSession({
        course_offering_id: parseInt(offeringId),
        room_id: parseInt(roomId),
        teacher_id: user?.teacher?.id || 1,
        title: title.trim(),
        grace_period_minutes: parseInt(graceMinutes),
      });
      setIsModalOpen(false);
      setTitle("");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to create session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = async (id) => {
    await api.startSession(id);
    loadData();
  };

  const handlePause = async (id) => {
    await api.pauseSession(id);
    loadData();
  };

  const handleClose = async (id) => {
    if (!window.confirm("Close session? Unmarked enrolled students will be marked Absent.")) return;
    await api.closeSession(id);
    loadData();
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Teacher Class Hub</h2>
          <p className="text-sm text-slate-400 mt-1">
            Instructor: <span className="text-slate-200 font-semibold">{user?.full_name}</span> | Manage sessions and real-time attendance
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch New Class Session</span>
        </button>
      </div>

      {/* Today's Assigned Classes */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>My Course Offerings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offerings.map((off) => (
            <div key={off.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {off.course_code}
                </span>
                <span className="text-xs text-slate-400">{off.section_name}</span>
              </div>
              <h4 className="font-bold text-slate-100 text-base">{off.course_name}</h4>
              <p className="text-xs text-slate-400">
                Semester {off.semester} • Academic Year {off.academic_year}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Sessions */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <span>Class Attendance Sessions</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Turnout</th>
                <th className="py-3 px-4 text-right">Session Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{sess.title}</div>
                    <div className="text-xs text-indigo-400 font-mono">{sess.course_name}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300">
                    <div>{sess.date}</div>
                    <div className="text-slate-500">{new Date(sess.start_time).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300">{sess.room_number || "Lab 401"}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={sess.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs font-semibold text-emerald-400">
                      {sess.present_count + sess.late_count} / {sess.total_enrolled} Present
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Grace: {sess.grace_period_minutes}m
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {sess.status === "ACTIVE" && (
                      <>
                        <button
                          onClick={() => onNavigateToLive(sess.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Live HUD</span>
                        </button>
                        <button
                          onClick={() => handlePause(sess.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium"
                          title="Pause Session"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleClose(sess.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium"
                          title="Close Session"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {sess.status === "PAUSED" && (
                      <button
                        onClick={() => handleStart(sess.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-600/30"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>
                    )}
                    {sess.status === "CLOSED" && (
                      <span className="text-xs text-slate-500 font-mono">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">Create Attendance Session</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CS401 Lecture 15: Congestion Control"
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Course Offering</label>
                <select
                  value={offeringId}
                  onChange={(e) => setOfferingId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  {offerings.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.course_code} - {off.course_name} ({off.section_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Classroom / Room</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.building} - {r.room_number} (Capacity: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={graceMinutes}
                  onChange={(e) => setGraceMinutes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Arrivals within grace period are marked Present.</p>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? "Creating..." : "Start Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
