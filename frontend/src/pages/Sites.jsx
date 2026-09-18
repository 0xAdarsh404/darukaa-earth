import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Map from "../components/Map";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Sites() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const projectId = 1;

  const [sites, setSites] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSites = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/projects/${projectId}/sites`
      );

      setSites(response.data || []);
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
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const handlePolygonCreated = useCallback((coordinates) => {
    setSelectedPolygon(coordinates);
    setSuccess("");
    setError("");
  }, []);

  const handleCreateSite = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter a site name.");
      return;
    }

    if (!selectedPolygon) {
      setError("Please draw a polygon on the map first.");
      return;
    }

    try {
      setSaving(true);

      await api.post(
        `/projects/${projectId}/sites`,
        {
          name: name.trim(),
          description: description.trim() || null,
          coordinates: selectedPolygon,
        }
      );

      setName("");
      setDescription("");
      setSelectedPolygon(null);

      setSuccess("Environmental site created successfully.");

      await loadSites();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to create site."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <header className="bg-slate-950 text-white shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
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

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-96 bg-white border-r border-slate-200 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold text-slate-900">
            Environmental Sites
          </h1>

          <p className="text-sm text-slate-500 mt-2 mb-6">
            Draw an environmental site boundary on the map
            and save it to your project.
          </p>

          {/* Create form */}
          <div className="rounded-2xl border border-slate-200 p-5 mb-6">
            <h2 className="font-bold text-slate-900 mb-4">
              Create New Site
            </h2>

            <form
              onSubmit={handleCreateSite}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="site-name"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Site Name
                </label>

                <input
                  id="site-name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. Sundarbans Test Site"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="site-description"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Description
                </label>

                <textarea
                  id="site-description"
                  rows="3"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe this environmental site..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div
                className={`rounded-lg px-3 py-3 text-sm ${
                  selectedPolygon
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-50 text-slate-600"
                }`}
              >
                {selectedPolygon
                  ? "✓ Polygon selected. Ready to save."
                  : "① Click the polygon tool on the map and draw your boundary."}
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-lg transition"
              >
                {saving
                  ? "Saving Site..."
                  : "Save Environmental Site"}
              </button>
            </form>
          </div>

          {/* Sites list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900">
                Saved Sites
              </h2>

              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {sites.length}
              </span>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">
                Loading sites...
              </p>
            ) : sites.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center">
                <div className="text-3xl mb-2">📍</div>

                <p className="text-sm text-slate-500">
                  No sites yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {site.name}
                    </h3>

                    {site.description && (
                      <p className="text-sm text-slate-500 mt-1">
                        {site.description}
                      </p>
                    )}

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
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1">
          <Map
            sites={sites}
            onPolygonCreated={handlePolygonCreated}
          />
        </main>
      </div>
    </div>
  );
}

export default Sites;