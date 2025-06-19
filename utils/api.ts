export const API_BASE_URL = "https://turantalim2.pythonanywhere.com/";

export const fetchData = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        return navigateTo("/auth/login"); // Token muddati tugasa, logout
      }
      throw new Error(`Xatolik: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("API xatosi:", error);
    throw error;
  }
};
