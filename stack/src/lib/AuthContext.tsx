
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axiosInstance from "@/lib/axiosInstance";

interface AuthContextType {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  Login: (formData: any) => Promise<void>;
  Signup: (formData: any) => Promise<void>;
  Logout: () => void; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Restore the saved login when the page reloads.
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser?.token && parsedUser?.data) {
          setUser(parsedUser.data);
        }
      }
    } catch (error) {
      console.error("Could not restore login:", error);
    }
  }, []);

  const Login = async (formData: any) => {
    setLoading(true);

    try {
      const response = await axiosInstance.post("/user/login", formData);
      const { data, token } = response.data;

      if (!token || !data) {
        throw new Error("The server did not return a user and token.");
      }

      localStorage.setItem("user", JSON.stringify({ data, token }));
      setUser(data);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const Signup = async (formData: any) => {
    setLoading(true);

    try {
      const response = await axiosInstance.post("/user/signup", formData);
      const { data, token } = response.data;

      if (!token || !data) {
        throw new Error("The server did not return a user and token.");
      }

      localStorage.setItem("user", JSON.stringify({ data, token }));
      setUser(data);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const Logout = () => {
  localStorage.removeItem("user");
  setUser(null);
};

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, Login, Signup,Logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
