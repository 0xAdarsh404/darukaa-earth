import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", null, {
        params: {
          email,
          password,
        },
      });

      login(response.data.access_token);

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Login failed. Please check your email and password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 mb-4">
            <span className="text-3xl">🌍</span>
          </div>

          <h1 className="text-3xl font-bold text-white">
            Darukaa.Earth
          </h1>

          <p className="text-slate-400 mt-2">
            Environmental Intelligence Platform
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="text-slate-500 mt-1 mb-6">
            Sign in to your account
          </p>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-emerald-500
                focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-emerald-500
                focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700
              disabled:bg-emerald-400 text-white font-semibold py-3
              rounded-lg transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-emerald-600 font-semibold hover:text-emerald-700"
            >
              Create account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;