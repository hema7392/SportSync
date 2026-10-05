import React, { useState } from 'react';
import Modal from './Modal';
import Alert from './Alert';
import { AlertTriangle } from 'lucide-react';

export default function CancelModal({ isOpen, onClose, onConfirm, session }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for cancelling this session.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onConfirm(session.id, reason.trim());
      setReason('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to cancel the session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!loading) {
          setError('');
          setReason('');
          onClose();
        }
      }}
      title={`Cancel ${session.sport?.name || 'Sport'} Session?`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p>
            Cancelling this session will prevent any further players from joining and notify all joined players with your reason.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div>
          <label htmlFor="cancel-reason" className="block text-sm font-semibold text-slate-300 mb-1.5">
            Cancellation Reason <span className="text-rose-400">*</span>
          </label>
          <textarea
            id="cancel-reason"
            rows="3"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Ground is unavailable, heavy rain forecasted, or unavoidable personal emergency..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setError('');
              setReason('');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-colors"
          >
            Keep Session
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-rose-600/25 disabled:opacity-50"
          >
            {loading ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
