import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
import { BASE_URL } from "../constants/BASE_URL";
import { AuthContext } from "../context/AuthContext";

const validationSchema = Yup.object().shape({
    emailId: Yup.string()
        .required("Email is required")
        .email("Enter a valid email"),
    password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain at least one uppercase letter")
        .matches(/\d/, "Must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least one special character"),
});

const Login = () => {
    const [apiError, setApiError] = useState("");
    const [apiSuccess, setApiSuccess] = useState("");
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = async (data) => {
        try {
            setApiError("");
            setApiSuccess("");

            const res = await axios.post(BASE_URL + "auth/login", data, {
                withCredentials: true,
            });

            setApiSuccess(res.data.message);

            // ✅ Update auth state immediately
            setAuth({ loading: false, isAuthenticated: true });

            // ✅ Navigate to home
            navigate("/");
        } catch (err) {
            if (err.response && err.response.data) {
                setApiError(err.response.data.message || "Login failed");
            } else {
                setApiError("Something went wrong, please try again.");
            }
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
                <h3 className="text-center mb-3 text-primary">Login</h3>

                {/* API error / success messages */}
                {apiError && <div className="alert alert-danger">{apiError}</div>}
                {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Email */}
                    <div className="mb-3">
                        <label htmlFor="emailId" className="form-label">Email address</label>
                        <input
                            type="email"
                            id="emailId"
                            className={`form-control ${errors.emailId ? "is-invalid" : ""}`}
                            placeholder="Enter email"
                            {...register("emailId")}
                        />
                        <div className="invalid-feedback">{errors.emailId?.message}</div>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                            placeholder="Enter password"
                            {...register("password")}
                        />
                        <div className="invalid-feedback">{errors.password?.message}</div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
