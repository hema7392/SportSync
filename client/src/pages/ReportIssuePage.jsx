import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { issuesApi } from '../api/issues';
import { categoriesApi } from '../api/categories';
import { locationsApi } from '../api/locations';
import {
  PlusCircle,
  AlertCircle,
  Building,
  MapPin,
  Tag,
  Flame,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

export function ReportIssuePage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [locations, setLocations] = useState([]);

  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    locationId: '',
    specificArea: '',
    priority: 'MEDIUM',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState('');

  // Load active categories and buildings
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, buildRes] = await Promise.all([
          categoriesApi.getCategories(false), // active only
          locationsApi.getBuildings(false), // active only
        ]);
        setCategories(catRes.categories || []);
        setBuildings(buildRes.buildings || []);
      } catch (err) {
        setError('Failed to load categories and campus locations. Please refresh.');
      } finally {
        setLoadingMeta(false);
      }
    }
    loadMeta();
  }, []);

  // Cascading location fetch when selectedBuildingId changes
  useEffect(() => {
    if (!selectedBuildingId) {
      setLocations([]);
      setFormData((prev) => ({ ...prev, locationId: '' }));
      return;
    }

    async function loadLocations() {
      try {
        const res = await locationsApi.getLocations({ buildingId: selectedBuildingId, all: false });
        setLocations(res.locations || []);
        setFormData((prev) => ({ ...prev, locationId: '' }));
      } catch (err) {
        console.error(err);
      }
    }
    loadLocations();
  }, [selectedBuildingId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setError('Please provide a descriptive title (at least 3 characters).');
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return;
    }

    if (!formData.categoryId) {
      setError('Please select an issue category.');
      return;
    }

    if (!formData.locationId) {
      setError('Please select a specific campus location/room.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: parseInt(formData.categoryId, 10),
        locationId: parseInt(formData.locationId, 10),
        specificArea: formData.specificArea.trim() || null,
        priority: formData.priority,
        imageUrl: formData.imageUrl.trim() || null,
      };

      const res = await issuesApi.createIssue(payload);
      navigate(`/issues/${res.issue.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit issue report.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingMeta) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading reporting options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <Link
            to="/issues"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Issues Directory
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Report a Campus Issue
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit a maintenance complaint with location and severity for technician dispatch
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              Issue Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Fluorescent tube flickering rapidly near lecture podium"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-teal-400" />
                Category *
              </label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Priority / Severity *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
              >
                <option value="LOW">Low (Minor cosmetic / non-urgent)</option>
                <option value="MEDIUM">Medium (Standard campus fixture problem)</option>
                <option value="HIGH">High (Impacts ongoing classes / safety hazard)</option>
                <option value="CRITICAL">Critical (Emergency / Flood / Severe power hazard)</option>
              </select>
            </div>
          </div>

          {/* Cascading Location Selection: Building -> Room/Area */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              Campus Venue & Room Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Step 1: Building */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  1. Campus Building *
                </label>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 transition"
                >
                  <option value="">Select Building...</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.code ? `(${b.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Specific Location/Room */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  2. Room / Specific Facility *
                </label>
                <select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleChange}
                  required
                  disabled={!selectedBuildingId}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 transition disabled:opacity-40"
                >
                  <option value="">
                    {selectedBuildingId ? 'Select Room/Area...' : 'Choose a building first'}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.floor ? `— ${loc.floor}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exact Area Note */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                Precise Area / Desk / Spot Note (Optional)
              </label>
              <input
                type="text"
                name="specificArea"
                value={formData.specificArea}
                onChange={handleChange}
                placeholder="e.g. Row 4 desk 3, near east window, ceiling light panel #2"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Description * (min 10 characters)
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail, how it occurred, and any potential hazard to staff or students..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition resize-none"
            />
          </div>

          {/* Optional Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Image URL (Optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/... or hosted image link"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Submitting Report...' : 'Submit Issue Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
