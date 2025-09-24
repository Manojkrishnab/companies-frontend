import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  const { auth } = useContext(AuthContext);

  if (auth.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            auth.isAuthenticated ? <Home /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/login"
          element={
            auth.isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
