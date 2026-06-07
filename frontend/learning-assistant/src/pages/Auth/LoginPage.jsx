import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext";
import authService from "../../services/authService";
import { BrainCircuit, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("example@test.com");
  const [password, setPassword] = useState("Test@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      console.log("LOGIN SERVICE RESPONSE:", response);
      
      const actualData = response?.data?.data ?? response?.data ?? response;
      
      console.log("ACTUAL LOGIN DATA:", actualData);
      console.log("TOKEN:", actualData?.token);
      console.log("USER:", actualData?.user);
      
      login(actualData.user, actualData.token);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to login. Please check your credentials.");
      toast.error(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />

      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6">
              <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
            </div>

            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              Welcome Back
            </h1>

            <p className="text-sm text-slate-500">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>

              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === "email"
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }`}
                >
                  <Mail className="w-5 h-5" strokeWidth={2} />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white/70 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === "password"
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }`}
                >
                  <Lock className="w-5 h-5" strokeWidth={2} />
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white/70 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                  placeholder="********"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-12 rounded-xl bg-slate-900 text-white font-medium overflow-hidden transition-all duration-200 hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </span>

              <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;