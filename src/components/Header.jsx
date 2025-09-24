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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 shadow-sm">
      <div className="container-fluid">
        <span
          className="navbar-brand fw-bold fs-4"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Companies
        </span>

        <div className="d-flex">
          <button className="btn btn-outline-light" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
