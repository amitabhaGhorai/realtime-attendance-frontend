import React, { useState, useEffect } from "react";
import { api } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import { Cpu, Activity, RefreshCw, Radio, CheckCircle, Wifi } from "lucide-react";

export const DevicesView = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDevices = async () => {
    try {
      const res = await api.getDevices();
      setDevices(res);
    } catch (err) {
      console.error("Error loading devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePing = async (id) => {
    await api.pingHeartbeat(id);
    loadDevices();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Camera Fleet & Sensor Devices</h2>
          <p className="text-sm text-slate-400 mt-1">Live heartbeat telemetry for edge attendance cameras</p>
        </div>

        <button
          onClick={loadDevices}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((d) => (
          <div key={d.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Cpu className="w-6 h-6" />
              </div>
              <StatusBadge status={d.status} />
            </div>

            <div>
              <div className="text-xs font-mono text-indigo-400 font-bold">{d.device_code}</div>
              <h3 className="font-bold text-slate-100 text-lg">{d.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Assigned Room: {d.room_number || "Lab 401"}</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>IP Address:</span>
                <span className="font-mono text-slate-200">{d.ip_address || "192.168.1.101"}</span>
              </div>
              <div className="flex justify-between">
                <span>Firmware:</span>
                <span className="font-mono text-slate-200">{d.software_version}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Heartbeat:</span>
                <span className="font-mono text-emerald-400">
                  {new Date(d.last_heartbeat).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handlePing(d.id)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center justify-center space-x-2 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate Ping / Heartbeat</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
