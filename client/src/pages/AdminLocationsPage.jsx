import React, { useState, useEffect } from 'react';
import { locationsApi } from '../api/locations';
import { Modal } from '../components/Modal';
import {
  Building2,
  PlusCircle,
  MapPin,
  CheckCircle,
  XCircle,
  Layers,
  AlertCircle,
  Plus,
} from 'lucide-react';

export function AdminLocationsPage() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [buildingForm, setBuildingForm] = useState({ name: '', code: '', description: '' });
  const [roomForm, setRoomForm] = useState({ name: '', floor: '' });
  const [modalError, setModalError] = useState('');

  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const res = await locationsApi.getBuildings(true); // all = true
      setBuildings(res.buildings || []);
    } catch (err) {
      setError(err.message || 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleCreateBuilding = async (e) => {
    e.preventDefault();
    if (!buildingForm.name.trim()) {
      setModalError('Building name is required.');
      return;
    }
    setActionLoading(true);
    setModalError('');
    try {
      await locationsApi.createBuilding(buildingForm);
      setIsBuildingModalOpen(false);
      setBuildingForm({ name: '', code: '', description: '' });
      await fetchBuildings();
    } catch (err) {
      setModalError(err.message || 'Failed to create building');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.name.trim() || !selectedBuilding) {
      setModalError('Room / Location name is required.');
      return;
    }
    setActionLoading(true);
    setModalError('');
    try {
      await locationsApi.createLocation({
        buildingId: selectedBuilding.id,
        name: roomForm.name.trim(),
        floor: roomForm.floor.trim() || null,
      });
      setIsRoomModalOpen(false);
      setRoomForm({ name: '', floor: '' });
      await fetchBuildings();
    } catch (err) {
      setModalError(err.message || 'Failed to add room');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBuilding = async (b) => {
    try {
      await locationsApi.updateBuilding(b.id, { isActive: !b.isActive });
      await fetchBuildings();
    } catch (err) {
      alert(err.message || 'Failed to update building');
    }
  };

  const handleToggleLocation = async (loc) => {
    try {
      await locationsApi.updateLocation(loc.id, { isActive: !loc.isActive });
      await fetchBuildings();
    } catch (err) {
      alert(err.message || 'Failed to update location');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Campus Locations & Facilities
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize campus buildings, academic wings, labs, and specific rooms
          </p>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setIsBuildingModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add Building
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Buildings Accordion / List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading campus facilities...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {buildings.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border bg-slate-900/80 p-5 space-y-4 transition ${
                b.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
              }`}
            >
              {/* Building Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{b.name}</h3>
                      {b.code && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {b.code}
                        </span>
                      )}
                      {b.isActive ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{b.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedBuilding(b);
                      setModalError('');
                      setIsRoomModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-400" />
                    Add Room
                  </button>

                  <button
                    onClick={() => handleToggleBuilding(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      b.isActive
                        ? 'text-amber-400 hover:bg-amber-500/10'
                        : 'text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {b.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>

              {/* Rooms Sub-list */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Configured Rooms & Areas ({b.locations?.length || 0})
                </p>

                {b.locations?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No specific rooms configured yet. Click "Add Room" to register spaces.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {b.locations.map((loc) => (
                      <div
                        key={loc.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          loc.isActive
                            ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                            : 'bg-slate-950/20 border-slate-800/40 text-slate-500 opacity-60'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-white">{loc.name}</p>
                          <p className="text-[10px] text-slate-400">{loc.floor || 'Standard Floor'}</p>
                        </div>

                        <button
                          onClick={() => handleToggleLocation(loc)}
                          className="text-[10px] font-semibold text-slate-400 hover:text-white"
                        >
                          {loc.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Create Building */}
      <Modal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        title="Add Campus Building"
      >
        <form onSubmit={handleCreateBuilding} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Building Name *
            </label>
            <input
              type="text"
              required
              value={buildingForm.name}
              onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
              placeholder="e.g. Science & Innovation Tower"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Building Code (Optional)
            </label>
            <input
              type="text"
              value={buildingForm.code}
              onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })}
              placeholder="e.g. SCI-TOW"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={buildingForm.description}
              onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
              placeholder="Primary facilities and departments hosted in this building..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsBuildingModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md disabled:opacity-50"
            >
              Save Building
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Create Room under Building */}
      <Modal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        title={`Add Room to ${selectedBuilding?.name}`}
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Room / Location Name *
            </label>
            <input
              type="text"
              required
              value={roomForm.name}
              onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              placeholder="e.g. Robotics Workshop 102"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Floor Level (Optional)
            </label>
            <input
              type="text"
              value={roomForm.floor}
              onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
              placeholder="e.g. 1st Floor / Basement / Mezzanine"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md disabled:opacity-50"
            >
              Add Room
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
