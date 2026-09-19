import React, { useState, useRef, useEffect } from "react";
import { api } from "../api";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Trash2, X, Sparkles } from "lucide-react";

export const FaceEnrollmentModal = ({ student, isOpen, onClose, onEnrolled }) => {
  if (!isOpen || !student) return null;

  const [step, setStep] = useState(1); // 1: Capture, 2: Review, 3: Success
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamActive, setStreamActive] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
    } catch (err) {
      setError("Webcam access denied or unavailable. You can also upload face photos.");
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  };

  const captureSample = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    const b64 = canvas.toDataURL("image/jpeg", 0.85);

    setSamples((prev) => [...prev, b64].slice(0, 3));
  };

  const handleEnroll = async () => {
    if (samples.length === 0) {
      setError("Please capture at least 1 face sample.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.enrollFace(student.id, samples);
      setStep(3);
      if (onEnrolled) onEnrolled();
    } catch (err) {
      setError(err.message || "Face enrollment failed. Ensure good lighting and sharpness.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm(`Revoke and purge biometric template for ${student.name}?`)) return;
    setRevoking(true);
    try {
      await api.revokeBiometrics(student.id, "Authorized user biometric purge");
      alert("Biometric template successfully deleted.");
      if (onEnrolled) onEnrolled();
      onClose();
    } catch (err) {
      alert(err.message || "Failed to revoke template.");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Camera className="w-5 h-5 text-indigo-400" />
              <span>Biometric Face Enrollment</span>
            </h3>
            <p className="text-xs text-slate-400">
              Student: <span className="text-slate-200 font-semibold">{student.name}</span> ({student.roll_number})
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 3 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-100">Face Enrolled Successfully!</h4>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                128-dimensional biometric centroid template generated with Laplacian sharpness verification.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <>
              {/* Video Viewport */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror transform -scale-x-100"
                />
                <div className="absolute inset-0 border-2 border-dashed border-indigo-400/40 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-56 border-2 border-indigo-400/80 rounded-full pointer-events-none opacity-60"></div>
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-mono text-slate-300 border border-slate-700">
                  Samples: {samples.length} / 3 Captured
                </div>
              </div>

              {/* Sample Thumbnails */}
              <div className="flex items-center space-x-3">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="flex-1 aspect-video rounded-xl bg-slate-800/80 border border-slate-700 overflow-hidden flex items-center justify-center relative"
                  >
                    {samples[idx] ? (
                      <img src={samples[idx]} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">Sample {idx + 1}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  {student.has_face_template && (
                    <button
                      onClick={handleRevoke}
                      disabled={revoking}
                      className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 rounded-xl border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{revoking ? "Revoking..." : "Revoke Biometrics"}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setSamples([])}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl border border-slate-700"
                  >
                    Reset
                  </button>
                  {samples.length < 3 ? (
                    <button
                      type="button"
                      onClick={captureSample}
                      className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Shot ({samples.length + 1}/3)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEnroll}
                      disabled={loading}
                      className="flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{loading ? "Generating Centroid..." : "Confirm & Save Template"}</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
