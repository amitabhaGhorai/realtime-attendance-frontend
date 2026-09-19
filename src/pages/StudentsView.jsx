import React, { useState, useEffect } from "react";
import { api } from "../api";
import { FaceEnrollmentModal } from "../components/FaceEnrollmentModal";
import {
  Users,
  Search,
  PlusCircle,
  Camera,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X
} from "lucide-react";

export const StudentsView = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [enrollStudent, setEnrollStudent] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Student Form
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deptId, setDeptId] = useState("");
  const [secId, setSecId] = useState("");
  const [semester, setSemester] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [stuRes, deptRes, secRes] = await Promise.all([
        api.getStudents(),
        api.getDepartments(),
        api.getSections(),
      ]);
      setStudents(stuRes);
      setDepartments(deptRes);
      setSections(secRes);
      if (deptRes.length > 0) setDeptId(deptRes[0].id);
      if (secRes.length > 0) setSecId(secRes[0].id);
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createStudent({
        roll_number: rollNo.trim(),
        name: name.trim(),
        email: email.trim(),
        department_id: parseInt(deptId),
        section_id: parseInt(secId),
        semester: parseInt(semester),
      });
      setIsAddOpen(false);
      setRollNo("");
      setName("");
      setEmail("");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to create student.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept ? s.department_id === parseInt(selectedDept) : true;
    return matchSearch && matchDept;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Student Biometric Directory</h2>
          <p className="text-sm text-slate-400 mt-1">Manage enrollments and face recognition templates</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Student Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Roll Number</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Department & Section</th>
              <th className="py-3 px-4">Semester</th>
              <th className="py-3 px-4">Biometric Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-mono text-xs font-bold text-slate-200">{s.roll_number}</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-100">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.email}</div>
                </td>
                <td className="py-3 px-4 text-xs">
                  <div>{s.department_name || "CSE"}</div>
                  <span className="text-slate-500">{s.section_name || "Section A"}</span>
                </td>
                <td className="py-3 px-4 text-xs">Sem {s.semester}</td>
                <td className="py-3 px-4">
                  {s.has_face_template ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Template Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Pending Capture
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setEnrollStudent(s)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{s.has_face_template ? "Re-Enroll Face" : "Enroll Face"}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Face Enrollment Wizard Modal */}
      <FaceEnrollmentModal
        student={enrollStudent}
        isOpen={!!enrollStudent}
        onClose={() => setEnrollStudent(null)}
        onEnrolled={loadData}
      />

      {/* Add Student Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">Register New Student</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Roll / Admission Number</label>
                <input
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. CS2026004"
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Williams"
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. david.w@student.edu"
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Section</label>
                  <select
                    value={secId}
                    onChange={(e) => setSecId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.section_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Semester</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? "Saving..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
