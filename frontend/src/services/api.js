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
 * Storage helpers for teacher auth state
 */
export const TEACHER_TOKEN_KEY = "ll_teacher_token";
export const TEACHER_USER_KEY = "ll_teacher_user";

export function getTeacherToken() {
  return localStorage.getItem(TEACHER_TOKEN_KEY);
}

export function getStoredTeacher() {
  const data = localStorage.getItem(TEACHER_USER_KEY);
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function setTeacherAuth(token, teacherUser) {
  if (token) localStorage.setItem(TEACHER_TOKEN_KEY, token);
  if (teacherUser) localStorage.setItem(TEACHER_USER_KEY, JSON.stringify(teacherUser));
}

export function removeTeacherAuth() {
  localStorage.removeItem(TEACHER_TOKEN_KEY);
  localStorage.removeItem(TEACHER_USER_KEY);
}

export function isTeacherAuthenticated() {
  return Boolean(getTeacherToken());
}

/**
 * Storage helpers for Store Manager auth state
 */
export const STORE_TOKEN_KEY = "ll_store_token";
export const STORE_USER_KEY = "ll_store_manager";

export function getStoreToken() {
  return localStorage.getItem(STORE_TOKEN_KEY);
}

export function getStoredStoreManager() {
  const data = localStorage.getItem(STORE_USER_KEY);
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function setStoreAuth(token, managerUser) {
  if (token) localStorage.setItem(STORE_TOKEN_KEY, token);
  if (managerUser) localStorage.setItem(STORE_USER_KEY, JSON.stringify(managerUser));
}

export function removeStoreAuth() {
  localStorage.removeItem(STORE_TOKEN_KEY);
  localStorage.removeItem(STORE_USER_KEY);
}

export function isStoreAuthenticated() {
  return Boolean(getStoreToken());
}

/**
 * Generic request helper with robust error handling and role-aware token attachment
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Attach appropriate Bearer token based on destination route if not explicitly set
  if (!options.headers || !options.headers["Authorization"]) {
    const teacherToken = getTeacherToken();
    const parentToken = getParentToken();
    const storeToken = getStoreToken();

    if (endpoint.startsWith("/store/admin") || endpoint.startsWith("/store/profile")) {
      const sToken = storeToken || teacherToken;
      if (sToken) defaultHeaders["Authorization"] = `Bearer ${sToken}`;
    } else if (endpoint.startsWith("/store/products") || endpoint.startsWith("/store/select") || endpoint.startsWith("/store/my-selections")) {
      if (parentToken) defaultHeaders["Authorization"] = `Bearer ${parentToken}`;
    } else if (endpoint.startsWith("/teacher") || endpoint.startsWith("/students")) {
      const token = teacherToken;
      if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;
    } else if (endpoint.startsWith("/parent") || endpoint.startsWith("/parents")) {
      const token = parentToken;
      if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;
    } else {
      const token = teacherToken || parentToken || storeToken;
      if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
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
      if (import.meta.env.DEV) {
        throw new Error(`Unable to connect to the local server. Please make sure the backend is running at ${API_URL}.`);
      } else {
        throw new Error("Unable to connect to the server. Please try again in a moment.");
      }
    }
    throw error;
  }
}

// ----------------------------------------------------
// STUDENTS APIs (Teacher Protected)
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

export async function getStudentAcademicDetails(id) {
  return apiRequest(`/students/${id}/details`);
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
// TEACHER AUTH APIs
// ----------------------------------------------------
export async function teacherLogin(credentials) {
  const data = await apiRequest("/teacher/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (data && data.token) {
    setTeacherAuth(data.token, data.teacher);
  }
  return data;
}

export async function teacherRegister(userData) {
  const data = await apiRequest("/teacher/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  if (data && data.token) {
    setTeacherAuth(data.token, data.teacher);
  }
  return data;
}

export function logoutTeacher() {
  removeTeacherAuth();
}

export async function getTeacherProfile() {
  return apiRequest("/teacher/profile");
}

export async function getTeacherStats() {
  return apiRequest("/teacher/stats");
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

export async function linkChildToParent(data) {
  return apiRequest('/parents/link-child', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ----------------------------------------------------
// KIDS STORE APIs (Parent View)
// ----------------------------------------------------
export async function getStoreProducts(category = "") {
  const params = new URLSearchParams();
  if (category && category.toLowerCase() !== "all") {
    params.append("category", category);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/store/products${query}`);
}

export async function getStoreProduct(id) {
  return apiRequest(`/store/products/${id}`);
}

export async function getStoreCategories() {
  return apiRequest("/store/categories");
}

// ----------------------------------------------------
// PARENT TOY SELECTION APIs
// ----------------------------------------------------
export async function selectStoreProductForChild({ student_id, product_id, quantity = 1 }) {
  return apiRequest("/store/select", {
    method: "POST",
    body: JSON.stringify({ student_id, product_id, quantity }),
  });
}

export async function getMyToySelections() {
  return apiRequest("/store/my-selections");
}

// ----------------------------------------------------
// STORE MANAGER AUTH & MANAGEMENT APIs
// ----------------------------------------------------
export async function storeManagerLogin(credentials) {
  const data = await apiRequest("/store/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (data && data.token) {
    setStoreAuth(data.token, data.manager);
  }
  return data;
}

export async function getStoreManagerProfile() {
  return apiRequest("/store/profile");
}

export function logoutStoreManager() {
  removeStoreAuth();
}

export async function adminGetStoreStats() {
  return apiRequest("/store/admin/stats");
}

export async function adminGetProducts(category = "") {
  const params = new URLSearchParams();
  if (category && category.toLowerCase() !== "all") {
    params.append("category", category);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/store/admin/products${query}`);
}

export async function adminGetProduct(id) {
  return apiRequest(`/store/admin/products/${id}`);
}

export async function adminAddProduct(productData) {
  return apiRequest("/store/admin/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export async function adminUpdateProduct(id, productData) {
  return apiRequest(`/store/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
}

export async function adminUpdateStock(id, stock) {
  return apiRequest(`/store/admin/products/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ stock }),
  });
}

export async function adminUpdatePrice(id, price) {
  return apiRequest(`/store/admin/products/${id}/price`, {
    method: "PATCH",
    body: JSON.stringify({ price }),
  });
}

export async function adminDeleteProduct(id) {
  return apiRequest(`/store/admin/products/${id}`, {
    method: "DELETE",
  });
}

export async function adminGetToySelections(category = "") {
  const params = new URLSearchParams();
  if (category && category.toLowerCase() !== "all") {
    params.append("category", category);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/store/admin/toy-selections${query}`);
}

export async function adminUpdateSelectionStatus(id, status) {
  return apiRequest(`/store/admin/toy-selections/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getStoreDetails() {
  return apiRequest("/store/details");
}

export async function adminUpdateStoreDetails(details) {
  return apiRequest("/store/admin/details", {
    method: "PUT",
    body: JSON.stringify(details),
  });
}

// ----------------------------------------------------
// SELLER DASHBOARD API ALIASES (Matching Planned Roles)
// ----------------------------------------------------
export const sellerLogin = storeManagerLogin;
export const sellerLogout = logoutStoreManager;
export const getSellerProfile = getStoreManagerProfile;
export const sellerGetStats = adminGetStoreStats;
export const sellerGetProducts = adminGetProducts;
export const sellerGetProduct = adminGetProduct;
export const sellerAddProduct = adminAddProduct;
export const sellerUpdateProduct = adminUpdateProduct;
export const sellerUpdateStock = adminUpdateStock;
export const sellerUpdatePrice = adminUpdatePrice;
export const sellerDeleteProduct = adminDeleteProduct;

export default {
  getStudents,
  getStudent,
  getStudentAcademicDetails,
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
  // Teacher APIs
  teacherLogin,
  teacherRegister,
  logoutTeacher,
  getTeacherProfile,
  getTeacherStats,
  getTeacherToken,
  getStoredTeacher,
  setTeacherAuth,
  removeTeacherAuth,
  isTeacherAuthenticated,
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
  linkChildToParent,
  getParentToken,
  getStoredParent,
  setParentAuth,
  removeParentAuth,
  isParentAuthenticated,
  getActiveChildId,
  setActiveChildId,
  // Kids Store APIs
  getStoreProducts,
  getStoreProduct,
  getStoreCategories,
  selectStoreProductForChild,
  getMyToySelections,
  // Store Manager & Seller APIs
  getStoreToken,
  getStoredStoreManager,
  setStoreAuth,
  removeStoreAuth,
  isStoreAuthenticated,
  storeManagerLogin,
  getStoreManagerProfile,
  logoutStoreManager,
  adminGetStoreStats,
  adminGetProducts,
  adminGetProduct,
  adminAddProduct,
  adminUpdateProduct,
  adminUpdateStock,
  adminUpdatePrice,
  adminDeleteProduct,
  adminGetToySelections,
  adminUpdateSelectionStatus,
  getStoreDetails,
  adminUpdateStoreDetails,
  sellerLogin,
  sellerLogout,
  getSellerProfile,
  sellerGetStats,
  sellerGetProducts,
  sellerGetProduct,
  sellerAddProduct,
  sellerUpdateProduct,
  sellerUpdateStock,
  sellerUpdatePrice,
  sellerDeleteProduct,
};
