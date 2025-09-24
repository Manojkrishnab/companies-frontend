import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../constants/BASE_URL";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ loading: true, isAuthenticated: false });

  // Check auth on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(BASE_URL + "auth/validate", {
          withCredentials: true,
        });
        if (res.data.valid) {
          setAuth({ loading: false, isAuthenticated: true });
        } else {
          setAuth({ loading: false, isAuthenticated: false });
        }
      } catch {
        setAuth({ loading: false, isAuthenticated: false });
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
