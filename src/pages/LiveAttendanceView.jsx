import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { useWebSocket } from "../context/WebSocketContext";
import { StatusBadge } from "../components/StatusBadge";
import { ManualOverrideModal } from "../components/ManualOverrideModal";
import {
  Camera,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Edit3
} from "lucide-react";

export const LiveAttendanceView = ({ initialSessionId }) => {
  const { lastEvent, eventsFeed } = useWebSocket();
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || null);
  const [sessionData, setSessionData] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  const [scanStatus, setScanStatus] = useState("Idle"); // Idle, Scanning, Matched, Rejected
  const [latestRecognition, setLatestRecognition] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Manual Override
  const [overrideRecord, setOverrideRecord] = useState(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Load active sessions
  const loadSessions = async () => {
    try {
      const res = await api.getSessions();
      setSessions(res);
      if (!selectedSessionId && res.length > 0) {
        // Pick first active or recent session
        const active = res.find((s) => s.status === "ACTIVE") || res[0];
        setSelectedSessionId(active.id);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (id) => {
    if (!id) return;
    try {
      const [sRes, recRes] = await Promise.all([
        api.getSession(id),
        api.getSessionRecords(id),
      ]);
      setSessionData(sRes);
      setRecords(recRes);
    } catch (err) {
      console.error("Failed to load session details:", err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      loadSessionDetails(selectedSessionId);
    }
  }, [selectedSessionId]);

  // Handle live WebSocket events
  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.event === "ATTENDANCE_MARKED" || lastEvent.event === "ATTENDANCE_OVERRIDE") {
      if (selectedSessionId) {
        loadSessionDetails(selectedSessionId);
      }
      playChime();
    }
  }, [lastEvent]);

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Webcam permission denied or no camera device available.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    clearInterval(scanIntervalRef.current);
  };

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !selectedSessionId) return;

    const video = videoRef.current;
    if (video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const b64 = canvas.toDataURL("image/jpeg", 0.75);

    setScanStatus("Scanning...");
    try {
      const res = await api.verifyFrame(selectedSessionId, b64);
      setLatestRecognition(res);

      if (res.success && res.result === "SUCCESS") {
        setScanStatus("Matched: " + res.student_name);
        playChime();
        loadSessionDetails(selectedSessionId);
      } else if (res.result === "DUPLICATE") {
        setScanStatus("Already Marked: " + res.student_name);
      } else {
        setScanStatus(res.message || res.result);
      }
    } catch (err) {
      setScanStatus("Scan error: " + err.message);
    }
  };

  // Auto-scan timer
  useEffect(() => {
    if (cameraActive && autoScan && selectedSessionId) {
      scanIntervalRef.current = setInterval(() => {
        captureAndVerify();
      }, 2000);
    } else {
      clearInterval(scanIntervalRef.current);
    }
    return () => clearInterval(scanIntervalRef.current);
  }, [cameraActive, autoScan, selectedSessionId]);

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const totalEnrolled = sessionData?.total_enrolled || records.length;
  const turnoutPercent = totalEnrolled > 0 ? Math.round(((presentCount + lateCount) / totalEnrolled) * 100) : 0;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Session Selector & Live Status Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-black text-slate-100">{sessionData?.title || "Active Class Session"}</h2>
            {sessionData && <StatusBadge status={sessionData.status} />}
          </div>
          <p className="text-xs text-slate-400">
            Course: <span className="text-indigo-400 font-mono font-semibold">{sessionData?.course_name}</span> | Room: {sessionData?.room_number || "Lab 401"} | Instructor: {sessionData?.teacher_name}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedSessionId || ""}
            onChange={(e) => setSelectedSessionId(parseInt(e.target.value))}
            className="px-3 py-2 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
            title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Live Turnout KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Enrolled</span>
          <div className="text-2xl font-black text-slate-100 mt-1">{totalEnrolled}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[11px] font-semibold uppercase text-emerald-400">Present</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{presentCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[11px] font-semibold uppercase text-amber-400">Late</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{lateCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[11px] font-semibold uppercase text-rose-400">Absent</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{absentCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold uppercase text-indigo-400">Turnout Rate</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{turnoutPercent}%</div>
        </div>
      </div>

      {/* Live Viewport & Recent Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Camera Viewport */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">Live Camera Stream</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-mono">{scanStatus}</span>
              <button
                onClick={cameraActive ? stopCamera : startCamera}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md ${
                  cameraActive
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {cameraActive ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Camera</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Video Container with HUD */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror transform -scale-x-100"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <Camera className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-sm text-slate-400">Camera preview inactive. Click 'Start Camera' to begin recognition.</p>
              </div>
            )}

            {/* HUD Bounding Target */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-56 border-2 border-indigo-400/60 rounded-3xl animate-pulse flex flex-col justify-between p-2">
                  <div className="flex justify-between text-[10px] font-mono text-indigo-400">
                    <span>AI DETECTION</span>
                    <span>60 FPS</span>
                  </div>
                  <div className="text-center text-[10px] font-mono text-emerald-400 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm self-center">
                    ALIGN FACE
                  </div>
                </div>
              </div>
            )}

            {/* Latest Match Banner */}
            {latestRecognition && latestRecognition.success && (
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between text-xs animate-in slide-in-from-bottom">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-200">
                    {latestRecognition.student_name} ({latestRecognition.roll_number})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={latestRecognition.status} />
                  <span className="font-mono text-slate-400">
                    {Math.round((latestRecognition.confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScan}
                onChange={(e) => setAutoScan(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Continuous Auto-Scan (Every 2 seconds)</span>
            </label>

            <button
              onClick={captureAndVerify}
              disabled={!cameraActive}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 disabled:opacity-50"
            >
              Manual Frame Scan
            </button>
          </div>
        </div>

        {/* Live WebSocket Event Feed */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3 flex flex-col shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Real-Time Broadcast Feed</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">WebSocket</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px] pr-1">
            {eventsFeed.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500">
                Waiting for incoming attendance scans...
              </div>
            ) : (
              eventsFeed.map((ev, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                    ev.event === "ATTENDANCE_MARKED"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-slate-200"
                      : ev.event === "DUPLICATE_SCAN"
                      ? "bg-amber-500/10 border-amber-500/20 text-slate-200"
                      : "bg-slate-800/80 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold tracking-wide uppercase text-[10px]">
                      {ev.event}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{ev.receivedAt}</span>
                  </div>
                  {ev.student_name && (
                    <div className="font-semibold text-slate-100">
                      {ev.student_name} ({ev.roll_number})
                    </div>
                  )}
                  {ev.status && (
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Status:</span>
                      <StatusBadge status={ev.status} />
                      {ev.confidence && (
                        <span className="text-slate-400 text-[10px]">
                          Conf: {Math.round(ev.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                  {ev.reason && <div className="text-slate-400 text-[11px]">{ev.reason}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Student Roster Grid */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Attendance Roster</h3>
            <p className="text-xs text-slate-400">Instant synchronized records for this session</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Manual Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-slate-400">{rec.roll_number}</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{rec.student_name}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-400">
                    {new Date(rec.marked_at).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
                      {rec.verification_method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setOverrideRecord(rec);
                        setIsOverrideOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Override</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Override Reason Modal */}
      <ManualOverrideModal
        record={overrideRecord}
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        onSuccess={() => loadSessionDetails(selectedSessionId)}
      />
    </div>
  );
};
