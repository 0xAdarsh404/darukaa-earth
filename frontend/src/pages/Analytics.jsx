import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const projectId = 1;

  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [analytics, setAnalytics] = useState([]);

  const [form, setForm] = useState({
    carbon_stock: "",
    biodiversity_score: "",
    species_richness: "",
    soil_organic_carbon: "",
    soil_ph: "",
    soil_moisture: "",
    rainfall: "",
    temperature: "",
  });

  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------
  // Load Sites
  // --------------------------------

  const loadSites = useCallback(async () => {
    try {
      setLoadingSites(true);
      setError("");

      const response = await api.get(
        `/projects/${projectId}/sites`
      );

      const siteData = response.data || [];

      setSites(siteData);

      if (siteData.length > 0) {
        setSelectedSite((current) =>
          current || String(siteData[0].id)
        );
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load environmental sites."
      );
    } finally {
      setLoadingSites(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  // --------------------------------
  // Load Analytics
  // --------------------------------

  const loadAnalytics = useCallback(async () => {
    if (!selectedSite) {
      setAnalytics([]);
      return;
    }

    try {
      setLoadingAnalytics(true);
      setError("");

      const response = await api.get(
        `/sites/${selectedSite}/analytics`
      );

      setAnalytics(response.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load analytics data."
      );
    } finally {
      setLoadingAnalytics(false);
    }
  }, [selectedSite, logout, navigate]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // --------------------------------
  // Form Change
  // --------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------
  // Save Analytics
  // --------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedSite) {
      setError("Please select an environmental site.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        carbon_stock: Number(form.carbon_stock),
        biodiversity_score: Number(
          form.biodiversity_score
        ),
        species_richness: Number(
          form.species_richness
        ),
        soil_organic_carbon: Number(
          form.soil_organic_carbon
        ),
        soil_ph: Number(form.soil_ph),
        soil_moisture: Number(form.soil_moisture),
        rainfall: Number(form.rainfall),
        temperature: Number(form.temperature),
      };

      await api.post(
        `/sites/${selectedSite}/analytics`,
        payload
      );

      setSuccess(
        "Environmental analytics saved successfully."
      );

      setForm({
        carbon_stock: "",
        biodiversity_score: "",
        species_richness: "",
        soil_organic_carbon: "",
        soil_ph: "",
        soil_moisture: "",
        rainfall: "",
        temperature: "",
      });

      await loadAnalytics();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to save analytics data."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------
  // Chart Data
  // --------------------------------

  const chartLabels = analytics.map((item) =>
    new Date(item.recorded_at).toLocaleDateString()
  );

  const chartData = {
    labels: chartLabels,

    datasets: [
      {
        label: "Carbon Stock",
        data: analytics.map(
          (item) => item.carbon_stock
        ),
        tension: 0.3,
      },
      {
        label: "Biodiversity Score",
        data: analytics.map(
          (item) => item.biodiversity_score
        ),
        tension: 0.3,
      },
      {
        label: "Soil Moisture",
        data: analytics.map(
          (item) => item.soil_moisture
        ),
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "top",
      },

      title: {
        display: false,
      },
    },
  };

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}

      <header className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="text-xl font-bold"
          >
            🌍 Darukaa.Earth
          </Link>

          <Link
            to="/dashboard"
            className="text-sm text-slate-300 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Environmental Analytics
          </h1>

          <p className="text-slate-500 mt-2">
            Record and monitor environmental conditions
            across your sites.
          </p>
        </div>

        {/* Messages */}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700">
            {success}
          </div>
        )}

        {/* Site Selection */}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <label
            htmlFor="site"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            Environmental Site
          </label>

          {loadingSites ? (
            <p className="text-sm text-slate-500">
              Loading sites...
            </p>
          ) : sites.length === 0 ? (
            <div>
              <p className="text-sm text-slate-500 mb-3">
                No environmental sites found.
              </p>

              <Link
                to="/sites"
                className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700"
              >
                Create Site
              </Link>
            </div>
          ) : (
            <select
              id="site"
              value={selectedSite}
              onChange={(e) =>
                setSelectedSite(e.target.value)
              }
              className="w-full md:w-96 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {sites.map((site) => (
                <option
                  key={site.id}
                  value={site.id}
                >
                  {site.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Analytics Form */}

        {sites.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Add Environmental Data
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {/* Carbon */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Carbon Stock
                </label>

                <input
                  type="number"
                  step="any"
                  name="carbon_stock"
                  value={form.carbon_stock}
                  onChange={handleChange}
                  placeholder="e.g. 125.5"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* Biodiversity */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Biodiversity Score
                </label>

                <input
                  type="number"
                  step="any"
                  name="biodiversity_score"
                  value={form.biodiversity_score}
                  onChange={handleChange}
                  placeholder="e.g. 82"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* Species */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Species Richness
                </label>

                <input
                  type="number"
                  step="any"
                  name="species_richness"
                  value={form.species_richness}
                  onChange={handleChange}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* SOC */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Soil Organic Carbon
                </label>

                <input
                  type="number"
                  step="any"
                  name="soil_organic_carbon"
                  value={form.soil_organic_carbon}
                  onChange={handleChange}
                  placeholder="e.g. 3.5"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* pH */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Soil pH
                </label>

                <input
                  type="number"
                  step="any"
                  name="soil_ph"
                  value={form.soil_ph}
                  onChange={handleChange}
                  placeholder="e.g. 6.8"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* Moisture */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Soil Moisture
                </label>

                <input
                  type="number"
                  step="any"
                  name="soil_moisture"
                  value={form.soil_moisture}
                  onChange={handleChange}
                  placeholder="e.g. 65"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* Rainfall */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rainfall
                </label>

                <input
                  type="number"
                  step="any"
                  name="rainfall"
                  value={form.rainfall}
                  onChange={handleChange}
                  placeholder="e.g. 120"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* Temperature */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Temperature
                </label>

                <input
                  type="number"
                  step="any"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  placeholder="e.g. 28.5"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* Button */}

              <div className="md:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  disabled={saving || !selectedSite}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-8 py-3 rounded-lg"
                >
                  {saving
                    ? "Saving..."
                    : "Save Environmental Data"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Analytics History */}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-5">
            Analytics History
          </h2>

          {loadingAnalytics ? (
            <p className="text-sm text-slate-500">
              Loading analytics...
            </p>
          ) : analytics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <div className="text-4xl mb-3">
                📊
              </div>

              <p className="text-slate-500">
                No analytics records yet.
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Add environmental data above to see
                records here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">
                      Environmental Record
                    </h3>

                    <span className="text-xs text-slate-500">
                      {new Date(
                        item.recorded_at
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        Carbon Stock
                      </p>

                      <p className="font-bold text-slate-900">
                        {item.carbon_stock}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Biodiversity
                      </p>

                      <p className="font-bold text-slate-900">
                        {item.biodiversity_score}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Species Richness
                      </p>

                      <p className="font-bold text-slate-900">
                        {item.species_richness}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Soil pH
                      </p>

                      <p className="font-bold text-slate-900">
                        {item.soil_ph}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Soil Organic Carbon
                      </p>

                      <p className="font-bold text-slate-900">
                        {item.soil_organic_carbon}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Soil Moisture
                      </p>

                      <p className="font-bold text-slate-900">
                        {item.soil_moisture}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Rainfall
                      </p>

                      <p className="font-bold text-slate-900">
                        {item.rainfall}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Temperature
                      </p>

                      <p className="font-bold text-slate-900">
                        {item.temperature}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Environmental Trends Chart */}

        {analytics.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Environmental Trends
            </h2>

            <p className="text-sm text-slate-500 mb-5">
              Track changes in carbon stock, biodiversity
              and soil moisture over time.
            </p>

            <div className="h-80">
              <Line
                data={chartData}
                options={chartOptions}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Analytics;