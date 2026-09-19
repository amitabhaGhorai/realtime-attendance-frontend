import React, { useState, useEffect } from "react";
import { api } from "../api";
import { BookOpen, Building, Grid, Plus, Check } from "lucide-react";

export const AcademicView = () => {
  const [tab, setTab] = useState("courses"); // courses, departments, sections, rooms
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [cRes, dRes, sRes, rRes] = await Promise.all([
        api.getCourses(),
        api.getDepartments(),
        api.getSections(),
        api.getRooms(),
      ]);
      setCourses(cRes);
      setDepartments(dRes);
      setSections(sRes);
      setRooms(rRes);
    } catch (err) {
      console.error("Error loading academic data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-100 tracking-tight">Academic Hierarchy Management</h2>
        <p className="text-sm text-slate-400 mt-1">Configure curriculum courses, cohorts, departments, and rooms</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        {[
          { id: "courses", label: "Courses & Subjects", icon: BookOpen },
          { id: "departments", label: "Departments", icon: Building },
          { id: "sections", label: "Sections & Cohorts", icon: Grid },
          { id: "rooms", label: "Rooms & Lecture Halls", icon: Building },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === "courses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {c.course_code}
                </span>
                <span className="text-xs text-slate-400">{c.credits} Credits</span>
              </div>
              <h3 className="font-bold text-slate-100 text-base">{c.course_name}</h3>
              <p className="text-xs text-slate-400">Semester {c.semester}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {departments.map((d) => (
            <div key={d.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs font-mono font-bold text-indigo-400">{d.code}</div>
              <h3 className="font-bold text-slate-100 text-base">{d.name}</h3>
            </div>
          ))}
        </div>
      )}

      {tab === "sections" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sections.map((s) => (
            <div key={s.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Academic Year {s.academic_year}</span>
              <h3 className="font-bold text-slate-100 text-base">{s.section_name}</h3>
              <p className="text-xs text-indigo-400">Semester {s.semester}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "rooms" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rooms.map((r) => (
            <div key={r.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">{r.building}</span>
              <h3 className="font-bold text-slate-100 text-base">{r.room_number}</h3>
              <p className="text-xs text-emerald-400">Capacity: {r.capacity} seats</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
