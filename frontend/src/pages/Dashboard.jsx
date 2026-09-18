import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const projectId = 1;

  const [sites, setSites] = useState([]);
  const [analyticsCount, setAnalyticsCount] = useState(0);
  const [latestBiodiversity, setLatestBiodiversity] =
    useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const sitesResponse = await api.get(
          `/projects/${projectId}/sites`
        );

        const siteData = sitesResponse.data || [];
        setSites(siteData);

        let totalAnalytics = 0;
        let latestRecord = null;

        for (const site of siteData) {
          try {
            const response = await api.get(
              `/sites/${site.id}/analytics`
            );

            const records = response.data || [];

            totalAnalytics += records.length;

            if (records.length > 0) {
              const record =
                records[records.length - 1];

              if (
                !latestRecord ||
                new Date(record.recorded_at) >
                  new Date(latestRecord.recorded_at)
              ) {
                latestRecord = record;
              }
            }
          } catch (analyticsError) {
            console.error(
              `Analytics load failed for site ${site.id}`,
              analyticsError
            );
          }
        }

        setAnalyticsCount(totalAnalytics);

        setLatestBiodiversity(
          latestRecord?.biodiversity_score ?? null
        );
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <header className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="text-xl font-bold"
          >
            🌍 Darukaa.Earth
          </Link>

          <button
            onClick={handleLogout}
            className="text-sm text-slate-300 hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Environmental Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Monitor your environmental sites and analytics.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Sites"
            value={loading ? "..." : sites.length}
            icon="📍"
          />

          <StatCard
            title="Active Sites"
            value={loading ? "..." : sites.length}
            icon="🌱"
          />

          <StatCard
            title="Analytics Records"
            value={loading ? "..." : analyticsCount}
            icon="📊"
          />

          <StatCard
            title="Latest Biodiversity"
            value={
              loading
                ? "..."
                : latestBiodiversity ?? "—"
            }
            icon="🦋"
          />
        </div>

        {/* Main cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/sites"
            className="bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-lg transition"
          >
            <div className="text-4xl mb-4">🗺️</div>

            <h2 className="text-xl font-bold text-slate-900">
              Environmental Sites
            </h2>

            <p className="text-slate-500 mt-2">
              Create, view and monitor geographical
              environmental boundaries.
            </p>

            <div className="mt-5 text-emerald-600 font-semibold">
              Open Site Map →
            </div>
          </Link>

          <Link
            to="/analytics"
            className="bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-lg transition"
          >
            <div className="text-4xl mb-4">📈</div>

            <h2 className="text-xl font-bold text-slate-900">
              Environmental Analytics
            </h2>

            <p className="text-slate-500 mt-2">
              Record and analyse carbon, biodiversity,
              soil and climate measurements.
            </p>

            <div className="mt-5 text-emerald-600 font-semibold">
              Open Analytics →
            </div>
          </Link>
        </div>

        {/* Site summary */}
        <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Your Sites
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Environmental locations in your project.
              </p>
            </div>

            <Link
              to="/sites"
              className="text-sm text-emerald-600 font-semibold"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <p className="text-slate-500">
              Loading dashboard...
            </p>
          ) : sites.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <div className="text-4xl mb-3">🌱</div>

              <p className="font-semibold text-slate-700">
                No environmental sites yet
              </p>

              <Link
                to="/sites"
                className="inline-block mt-3 text-emerald-600 font-semibold"
              >
                Create your first site →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.slice(0, 6).map((site) => (
                <div
                  key={site.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <h3 className="font-semibold text-slate-900">
                    {site.name}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {site.description ||
                      "Environmental monitoring site"}
                  </p>

                  <p className="text-xs text-slate-500 mt-3">
                    Area:{" "}
                    <span className="font-semibold text-slate-700">
                      {Number(
                        site.area_hectares || 0
                      ).toFixed(2)}{" "}
                      hectares
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-2">
            {value}
          </p>
        </div>

        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

export default Dashboard;