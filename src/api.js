const BASE_URL = import.meta.env.VITE_API_URL || "https://realtime-attendance-backend.onrender.com/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("attendance_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("attendance_token");
    localStorage.removeItem("attendance_user");
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/";
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  getMe: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),

  // Academic
  getDepartments: () => request("/departments"),
  getSections: (departmentId) =>
    request(departmentId ? `/sections?department_id=${departmentId}` : "/sections"),
  getRooms: () => request("/rooms"),
  getCourses: () => request("/courses"),
  getOfferings: (teacherId) =>
    request(teacherId ? `/course-offerings?teacher_id=${teacherId}` : "/course-offerings"),

  // Users
  getStudents: (deptId, secId) => {
    let url = "/students?";
    if (deptId) url += `department_id=${deptId}&`;
    if (secId) url += `section_id=${secId}`;
    return request(url);
  },
  createStudent: (data) =>
    request("/students", { method: "POST", body: JSON.stringify(data) }),
  getTeachers: () => request("/teachers"),
  getUsers: () => request("/users"),
  toggleUserStatus: (id, isActive) =>
    request(`/users/${id}/status?is_active=${isActive}`, { method: "PATCH" }),

  // Biometrics
  enrollFace: (studentId, samples) =>
    request("/biometrics/enroll", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, samples }),
    }),
  revokeBiometrics: (studentId, reason) =>
    request(`/biometrics/templates/${studentId}?reason=${encodeURIComponent(reason)}`, {
      method: "DELETE",
    }),

  // Sessions
  getSessions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append("date_str", filters.date);
    if (filters.teacherId) params.append("teacher_id", filters.teacherId);
    if (filters.status) params.append("status_filter", filters.status);
    return request(`/attendance/sessions?${params.toString()}`);
  },
  getSession: (id) => request(`/attendance/sessions/${id}`),
  createSession: (data) =>
    request("/attendance/sessions", { method: "POST", body: JSON.stringify(data) }),
  startSession: (id) =>
    request(`/attendance/sessions/${id}/start`, { method: "POST" }),
  pauseSession: (id) =>
    request(`/attendance/sessions/${id}/pause`, { method: "POST" }),
  closeSession: (id) =>
    request(`/attendance/sessions/${id}/close`, { method: "POST" }),

  // Attendance
  getSessionRecords: (sessionId) =>
    request(`/attendance/sessions/${sessionId}/records`),
  overrideRecord: (recordId, status, reason) =>
    request(`/attendance/records/${recordId}/override`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    }),

  // Camera Recognition
  verifyFrame: (sessionId, imageBase64, deviceId) =>
    request("/recognition/verify", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        image_base64: imageBase64,
        device_id: deviceId,
      }),
    }),

  // Reports
  getDailyReport: (dateStr) =>
    request(dateStr ? `/reports/daily?date_str=${dateStr}` : "/reports/daily"),
  getStudentReport: (studentId) => request(`/reports/student/${studentId}`),
  downloadCSV: async (sessionId) => {
    const token = localStorage.getItem("attendance_token");
    const url = sessionId ? `${BASE_URL}/reports/export/csv?session_id=${sessionId}` : `${BASE_URL}/reports/export/csv`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `attendance_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  },
  downloadPDF: async (sessionId) => {
    const token = localStorage.getItem("attendance_token");
    const url = sessionId ? `${BASE_URL}/reports/export/pdf?session_id=${sessionId}` : `${BASE_URL}/reports/export/pdf`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `attendance_report_${new Date().toISOString().split("T")[0]}.pdf`;
    link.click();
  },

  // Devices
  getDevices: () => request("/devices"),
  pingHeartbeat: (id) => request(`/devices/${id}/heartbeat`, { method: "POST" }),

  // Audit & Settings
  getAuditLogs: (action, entityType) => {
    let url = "/audit-logs?limit=50";
    if (action) url += `&action=${action}`;
    if (entityType) url += `&entity_type=${entityType}`;
    return request(url);
  },
  getSettings: () => request("/settings"),
  updateSettings: (data) =>
    request("/settings", { method: "POST", body: JSON.stringify(data) }),
};
