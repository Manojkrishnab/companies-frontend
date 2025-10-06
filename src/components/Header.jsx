import React, { useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../constants/BASE_URL";

const Header = () => {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "auth/logout", {}, { withCredentials: true });
      setAuth({ loading: false, isAuthenticated: false });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="flex items-center bg-gray-100 border-b p-3 px-4 shadow-sm">
      <div className="w-full flex items-center justify-between">
        <span
          className="text-gray-800 font-bold text-xl cursor-pointer"
          onClick={() => navigate("/")}
        >
          Companies
        </span>

        <div className="flex">
          <button
            className="border border-gray-500 text-gray-700 px-3 py-1 rounded hover:bg-white"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
