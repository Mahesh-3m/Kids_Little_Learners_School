const API_URL = import.meta.env.VITE_API_URL || "https://kids-little-learners-school.onrender.com/api";

/**
 * Storage helpers for parent auth state
 */
export const PARENT_TOKEN_KEY = "ll_parent_token";
export const PARENT_USER_KEY = "ll_parent_user";
export const PARENT_CHILD_KEY = "ll_parent_active_child";

export function getParentToken() {
  return localStorage.getItem(PARENT_TOKEN_KEY);
}

export function getStoredParent() {
  const data = localStorage.getItem(PARENT_USER_KEY);
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function setParentAuth(token, parentUser) {
  if (token) localStorage.setItem(PARENT_TOKEN_KEY, token);
  if (parentUser) localStorage.setItem(PARENT_USER_KEY, JSON.stringify(parentUser));
}

export function removeParentAuth() {
  localStorage.removeItem(PARENT_TOKEN_KEY);
  localStorage.removeItem(PARENT_USER_KEY);
  localStorage.removeItem(PARENT_CHILD_KEY);
}

export function isParentAuthenticated() {
  return Boolean(getParentToken());
}

export function getActiveChildId() {
  return localStorage.getItem(PARENT_CHILD_KEY);
}

export function setActiveChildId(childId) {
  if (childId) {
    localStorage.setItem(PARENT_CHILD_KEY, String(childId));
  } else {
    localStorage.removeItem(PARENT_CHILD_KEY);
  }
}

/**
 * Generic request helper with robust error handling and token attachment
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const token = getParentToken();
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (data && data.error && data.message ? `${data.error}: ${data.message}` : null) ||
        (data && data.message) ||
        (data && data.error) ||
        `Server error: ${response.status} ${response.statusText}`;
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(`Unable to connect to the server. Please make sure the backend is running at ${API_URL}.`);
    }
    throw error;
  }
}

// ----------------------------------------------------
// STUDENTS APIs
// ----------------------------------------------------
export async function getStudents(className = "", search = "") {
  const params = new URLSearchParams();
  if (className && className !== "All") params.append("class_name", className);
  if (search) params.append("search", search);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/students${query}`);
}

export async function getStudent(id) {
  return apiRequest(`/students/${id}`);
}

export async function getStudentsByClass(className) {
  return apiRequest(`/students/class/${encodeURIComponent(className)}`);
}

export async function addStudent(studentData) {
  return apiRequest("/students", {
    method: "POST",
    body: JSON.stringify(studentData),
  });
}

export async function updateStudent(id, studentData) {
  return apiRequest(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(studentData),
  });
}

export async function deleteStudent(id) {
  return apiRequest(`/students/${id}`, {
    method: "DELETE",
  });
}

// ----------------------------------------------------
// CLASSES APIs
// ----------------------------------------------------
export async function getClasses() {
  return apiRequest("/classes");
}

export async function getClass(id) {
  return apiRequest(`/classes/${id}`);
}

export async function getClassStudents(id) {
  return apiRequest(`/classes/${id}/students`);
}

// ----------------------------------------------------
// GAMES APIs
// ----------------------------------------------------
export async function getGames() {
  return apiRequest("/games");
}

export async function getGame(id) {
  return apiRequest(`/games/${id}`);
}

export async function completeGame(id, completionData) {
  return apiRequest(`/games/${id}/complete`, {
    method: "POST",
    body: JSON.stringify(completionData),
  });
}

export async function getStudentGames(studentId) {
  return apiRequest(`/games/student/${studentId}`);
}

// ----------------------------------------------------
// QUIZ APIs
// ----------------------------------------------------
export async function getQuizzes() {
  return apiRequest("/quiz");
}

export async function getQuiz(id) {
  return apiRequest(`/quiz/${id}`);
}

export async function submitQuizResult(resultData) {
  return apiRequest("/quiz/results", {
    method: "POST",
    body: JSON.stringify(resultData),
  });
}

// ----------------------------------------------------
// RESULTS APIs
// ----------------------------------------------------
export async function getResults(filters = {}) {
  const params = new URLSearchParams();
  if (filters.student_id) params.append("student_id", filters.student_id);
  if (filters.quiz_id) params.append("quiz_id", filters.quiz_id);
  if (filters.category && filters.category !== "All") params.append("category", filters.category);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/results${query}`);
}

export async function getStudentResults(studentId) {
  return apiRequest(`/results/student/${studentId}`);
}

// ----------------------------------------------------
// PROGRESS APIs
// ----------------------------------------------------
export async function getProgress(studentId) {
  return apiRequest(`/progress/student/${studentId}`);
}

export async function updateProgress(studentId, progressData) {
  return apiRequest(`/progress/student/${studentId}`, {
    method: "PUT",
    body: JSON.stringify(progressData),
  });
}

export async function getAllProgress() {
  return apiRequest("/progress/summary");
}

// ----------------------------------------------------
// PARENT / USER AUTH APIs
// ----------------------------------------------------
export async function parentLogin(credentials) {
  const data = await apiRequest("/parent/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (data && data.token) {
    setParentAuth(data.token, data.parent);
    if (data.children && data.children.length > 0) {
      setActiveChildId(data.children[0].id);
    }
  }
  return data;
}

export async function parentRegister(userData) {
  const data = await apiRequest("/parent/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  if (data && data.token) {
    setParentAuth(data.token, data.parent);
    if (data.children && data.children.length > 0) {
      setActiveChildId(data.children[0].id);
    }
  }
  return data;
}

// Aliases for general auth
export const login = parentLogin;
export const register = parentRegister;

export function logoutParent() {
  removeParentAuth();
}

export async function getParentProfile() {
  return apiRequest("/parents/profile");
}

export async function updateParentProfile(profileData) {
  const res = await apiRequest("/parents/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
  if (res && res.parent) {
    setParentAuth(getParentToken(), res.parent);
  }
  return res;
}

export async function getParentChildren() {
  return apiRequest("/parents/children");
}

export async function getChildDetails(childId) {
  return apiRequest(`/parents/children/${childId}`);
}

export async function getChildActivities(childId, limit = 30) {
  return apiRequest(`/parents/children/${childId}/activities?limit=${limit}`);
}

export async function getChildResults(childId) {
  return apiRequest(`/parents/children/${childId}/results`);
}

export async function getChildProgress(childId) {
  return apiRequest(`/parents/children/${childId}/progress`);
}

export async function getChildAchievements(childId) {
  return apiRequest(`/parents/children/${childId}/achievements`);
}

export default {
  getStudents,
  getStudent,
  getStudentsByClass,
  addStudent,
  updateStudent,
  deleteStudent,
  getClasses,
  getClass,
  getClassStudents,
  getGames,
  getGame,
  completeGame,
  getStudentGames,
  getQuizzes,
  getQuiz,
  submitQuizResult,
  getResults,
  getStudentResults,
  getProgress,
  updateProgress,
  getAllProgress,
  // Parent APIs
  parentLogin,
  parentRegister,
  login,
  register,
  logoutParent,
  getParentProfile,
  updateParentProfile,
  getParentChildren,
  getChildDetails,
  getChildActivities,
  getChildResults,
  getChildProgress,
  getChildAchievements,
  getParentToken,
  getStoredParent,
  setParentAuth,
  removeParentAuth,
  isParentAuthenticated,
  getActiveChildId,
  setActiveChildId,
};
