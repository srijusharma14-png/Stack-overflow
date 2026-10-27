import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");

    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        const token = parsedUser?.token;

        if (token) {
          req.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Invalid user data in localStorage:", error);
      }
    }
  }

  return req;
});

export default axiosInstance;
