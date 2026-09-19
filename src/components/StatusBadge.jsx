import React from "react";

export const StatusBadge = ({ status }) => {
  const s = (status || "").toUpperCase();

  switch (s) {
    case "PRESENT":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
          Present
        </span>
      );
    case "LATE":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
          Late
        </span>
      );
    case "ABSENT":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
          Absent
        </span>
      );
    case "EXCUSED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
          Excused
        </span>
      );
    case "ACTIVE":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span>
          Active
        </span>
      );
    case "PAUSED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span>
          Paused
        </span>
      );
    case "CLOSED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
          Closed
        </span>
      );
    case "ONLINE":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping"></span>
          Online
        </span>
      );
    case "OFFLINE":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          Offline
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
          {status || "Unknown"}
        </span>
      );
  }
};
