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

            // Update auth state immediately
            setAuth({ loading: false, isAuthenticated: true });

            // Navigate to home
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
        <>
            
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h3 className="text-center mb-4 font-semibold text-3xl text-blue-600"><i>Companies</i></h3>
                <div className="w-full max-w-sm bg-white rounded-lg shadow p-6">
                    <h3 className="text-center mb-4 text-2xl font-semibold text-blue-600">
                        Login
                    </h3>

                    {/* API error / success messages */}
                    {apiError && (
                        <div className="mb-3 rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700">
                            {apiError}
                        </div>
                    )}
                    {apiSuccess && (
                        <div className="mb-3 rounded border border-green-300 bg-green-100 px-3 py-2 text-sm text-green-700">
                            {apiSuccess}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* Email */}
                        <div className="mb-4">
                            <label htmlFor="emailId" className="block text-sm font-medium mb-1">
                                Email address
                            </label>
                            <input
                                type="email"
                                id="emailId"
                                placeholder="Enter email"
                                className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.emailId ? "border-red-500" : "border-gray-300"
                                    }`}
                                {...register("emailId")}
                            />
                            {errors.emailId && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errors.emailId.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter password"
                                className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-300"
                                    }`}
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;
