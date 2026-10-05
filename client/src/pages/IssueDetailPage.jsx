import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issuesApi } from '../api/issues';
import { usersApi } from '../api/users';
import { StatusBadge, PriorityBadge, RoleBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import {
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  Tag,
  User,
  HardHat,
  CheckCircle,
  AlertTriangle,
  Play,
  Check,
  RotateCcw,
  XCircle,
  MessageSquare,
  Send,
  History,
  Clock,
  Shield,
  FileText,
  AlertCircle,
} from 'lucide-react';

export function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isReporter, isTechnician } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Form states for modals
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchIssue = async () => {
    try {
      const res = await issuesApi.getIssueById(id);
      setIssue(res.issue);
    } catch (err) {
      setError(err.message || 'Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  // Load technicians when assign modal opens
  const openAssignModal = async () => {
    setModalError('');
    try {
      const res = await usersApi.getTechnicians();
      setTechnicians(res.technicians || []);
      setIsAssignModalOpen(true);
    } catch (err) {
      setError('Failed to load technician directory');
    }
  };

  // Submit technician assignment
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTechId) {
      setModalError('Please select a technician.');
      return;
    }
    setActionLoading(true);
    setModalError('');
    try {
      await issuesApi.assignTechnician(id, parseInt(selectedTechId, 10));
      setIsAssignModalOpen(false);
      await fetchIssue();
    } catch (err) {
      setModalError(err.message || 'Failed to assign technician');
    } finally {
      setActionLoading(false);
    }
  };

  // Start work (Technician or Admin)
  const handleStartWork = async () => {
    if (!window.confirm('Start work on this issue now? Status will change to IN_PROGRESS.')) return;
    setActionLoading(true);
    try {
      await issuesApi.acceptAndStartWork(id);
      await fetchIssue();
    } catch (err) {
      alert(err.message || 'Failed to start work');
    } finally {
      setActionLoading(false);
    }
  };

  // Resolve issue submit
  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolutionNote.trim() || resolutionNote.trim().length < 5) {
      setModalError('Please provide a meaningful resolution note (at least 5 characters).');
      return;
    }
    setActionLoading(true);
    setModalError('');
    try {
      await issuesApi.resolveIssue(id, resolutionNote.trim());
      setIsResolveModalOpen(false);
      setResolutionNote('');
      await fetchIssue();
    } catch (err) {
      setModalError(err.message || 'Failed to resolve issue');
    } finally {
      setActionLoading(false);
    }
  };

  // Reopen issue submit
  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim() || reopenReason.trim().length < 5) {
      setModalError('Please provide a reason for reopening (at least 5 characters).');
      return;
    }
    setActionLoading(true);
    setModalError('');
    try {
      await issuesApi.reopenIssue(id, reopenReason.trim());
      setIsReopenModalOpen(false);
      setReopenReason('');
      await fetchIssue();
    } catch (err) {
      setModalError(err.message || 'Failed to reopen issue');
    } finally {
      setActionLoading(false);
    }
  };

  // Close issue (Reporter or Admin)
  const handleClose = async () => {
    if (!window.confirm('Are you satisfied with the resolution and wish to permanently close this ticket?')) {
      return;
    }
    setActionLoading(true);
    try {
      await issuesApi.closeIssue(id);
      await fetchIssue();
    } catch (err) {
      alert(err.message || 'Failed to close issue');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel issue submit
  const handleCancel = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setModalError('');
    try {
      await issuesApi.cancelIssue(id, cancelReason.trim());
      setIsCancelModalOpen(false);
      setCancelReason('');
      await fetchIssue();
    } catch (err) {
      setModalError(err.message || 'Failed to cancel issue');
    } finally {
      setActionLoading(false);
    }
  };

  // Post comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setActionLoading(true);
    try {
      await issuesApi.addComment(id, {
        message: commentText.trim(),
        isInternal: isInternalComment,
      });
      setCommentText('');
      setIsInternalComment(false);
      await fetchIssue();
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setActionLoading(false);
    }
  };

  // Priority change (Admin only)
  const handlePriorityChange = async (newPriority) => {
    try {
      await issuesApi.updateIssue(id, { priority: newPriority });
      await fetchIssue();
    } catch (err) {
      alert(err.message || 'Failed to change priority');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Issue Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to retrieve this issue record.'}</p>
        <Link
          to="/issues"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Issues
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === issue.reporterId;
  const activeAssignment = issue.assignments?.find((a) => a.status === 'ACTIVE');
  const isAssignedTech = activeAssignment && activeAssignment.technicianId === user?.id;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <Link
            to="/issues"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Issues Directory
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-mono font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
              Ticket #{issue.id}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
              {issue.title}
            </h1>
          </div>
        </div>

        {/* Dynamic Action Buttons based on User Role & Status */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Admin Assign Button */}
          {isAdmin && !['CLOSED', 'CANCELLED'].includes(issue.status) && (
            <button
              onClick={openAssignModal}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition flex items-center gap-1.5"
            >
              <HardHat className="w-4 h-4" />
              {activeAssignment ? 'Reassign Tech' : 'Assign Technician'}
            </button>
          )}

          {/* Technician Start Work Button */}
          {(isAssignedTech || isAdmin) && ['ASSIGNED', 'REOPENED'].includes(issue.status) && (
            <button
              onClick={handleStartWork}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 transition flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              Start Work
            </button>
          )}

          {/* Technician/Admin Resolve Button */}
          {(isAssignedTech || isAdmin) && issue.status === 'IN_PROGRESS' && (
            <button
              onClick={() => {
                setModalError('');
                setIsResolveModalOpen(true);
              }}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Mark Resolved
            </button>
          )}

          {/* Reporter/Admin Close Issue */}
          {(isOwner || isAdmin) && issue.status === 'RESOLVED' && (
            <button
              onClick={handleClose}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Close
            </button>
          )}

          {/* Reporter/Admin Reopen Button */}
          {(isOwner || isAdmin) && issue.status === 'RESOLVED' && (
            <button
              onClick={() => {
                setModalError('');
                setIsReopenModalOpen(true);
              }}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reopen Ticket
            </button>
          )}

          {/* Reporter Cancel Button (Only if REPORTED) or Admin Cancel */}
          {((isOwner && issue.status === 'REPORTED') || (isAdmin && !['CLOSED', 'CANCELLED'].includes(issue.status))) && (
            <button
              onClick={() => {
                setModalError('');
                setIsCancelModalOpen(true);
              }}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 transition flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Cancel Report
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Details & Right Metadata Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Details, Resolution, Timeline & Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resolution Banner if Resolved or Closed */}
          {issue.resolutionNote && (
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle className="w-4 h-4" />
                Resolution Summary
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                "{issue.resolutionNote}"
              </p>
              {issue.resolvedAt && (
                <p className="text-[11px] text-emerald-500/80">
                  Resolved on {new Date(issue.resolvedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Description Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Problem Description
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {issue.description}
            </p>

            {issue.imageUrl && (
              <div className="pt-4 border-t border-slate-800">
                <p className="text-xs font-bold text-slate-400 mb-2">Attached Image Proof</p>
                <img
                  src={issue.imageUrl}
                  alt="Issue attachment"
                  className="rounded-xl border border-slate-800 max-h-72 object-cover"
                />
              </div>
            )}
          </div>

          {/* Activity Timeline Stream */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Chronological Activity & State Audit Trail
              </h3>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {issue.history?.map((h) => (
                <div key={h.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-sky-400 group-hover:scale-125 transition" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-white">{h.user?.name}</span>
                      <RoleBadge role={h.user?.role} />
                      <span className="text-[10px] text-slate-500">
                        {new Date(h.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments & Work Notes Section */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Discussion & Work Notes ({issue.comments?.length || 0})
                </h3>
              </div>
            </div>

            {/* Comment Stream */}
            <div className="space-y-3">
              {issue.comments?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No comments or work notes yet.</p>
              ) : (
                issue.comments?.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-xl border ${
                      c.isInternal
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{c.user?.name}</span>
                        <RoleBadge role={c.user?.role} />
                        {c.isInternal && (
                          <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                            Internal Staff Note
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.createdAt).toLocaleTimeString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {c.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input Form */}
            {!['CLOSED', 'CANCELLED'].includes(issue.status) && (
              <form onSubmit={handleCommentSubmit} className="space-y-3 pt-4 border-t border-slate-800">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post a question, update, or progress report..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 transition resize-none"
                />

                <div className="flex items-center justify-between">
                  {(isAdmin || isTechnician) ? (
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                      />
                      <span>Mark as internal technician/staff note</span>
                    </label>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    disabled={actionLoading || !commentText.trim()}
                    className="px-4 py-2 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-md transition flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post Comment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Status & Metadata Cards */}
        <div className="space-y-6">
          {/* Status & Priority Overview Card */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Current Status
              </p>
              <StatusBadge status={issue.status} size="lg" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Priority
              </p>
              {isAdmin && !['CLOSED', 'CANCELLED'].includes(issue.status) ? (
                <div className="space-y-1">
                  <select
                    value={issue.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                  <p className="text-[10px] text-slate-500">Admins can update priority directly</p>
                </div>
              ) : (
                <PriorityBadge priority={issue.priority} size="md" />
              )}
            </div>
          </div>

          {/* Assigned Technician Card */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-teal-400" />
              Assigned Technician
            </p>

            {activeAssignment ? (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-sm text-white">{activeAssignment.technician?.name}</p>
                <p className="text-xs text-slate-400">{activeAssignment.technician?.email}</p>
                {activeAssignment.technician?.phone && (
                  <p className="text-xs text-teal-400">{activeAssignment.technician?.phone}</p>
                )}
                <p className="text-[10px] text-slate-500 pt-1">
                  Assigned {new Date(activeAssignment.assignedAt).toLocaleDateString()} by{' '}
                  {activeAssignment.assignedBy?.name}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                <p className="text-xs text-slate-500">No technician currently assigned</p>
                {isAdmin && (
                  <button
                    onClick={openAssignModal}
                    className="mt-2 text-xs text-sky-400 hover:text-sky-300 font-bold"
                  >
                    + Assign Now
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Location Hierarchy Card */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              Campus Location
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Building:</span>
                <span className="font-semibold text-white">
                  {issue.location?.building?.name} ({issue.location?.building?.code})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Room / Facility:</span>
                <span className="font-semibold text-white">{issue.location?.name}</span>
              </div>
              {issue.location?.floor && (
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Floor Level:</span>
                  <span className="font-semibold text-white">{issue.location?.floor}</span>
                </div>
              )}
              {issue.specificArea && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Specific Area:</span>
                  <span className="font-semibold text-white text-right">{issue.specificArea}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reporter Details Card */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              Reporter Information
            </p>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-white">{issue.reporter?.name}</p>
              <p className="text-slate-400">{issue.reporter?.email}</p>
              {issue.reporter?.department && (
                <p className="text-slate-500">{issue.reporter?.department}</p>
              )}
              <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                Logged on {new Date(issue.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Assign Technician Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Issue to Maintenance Technician"
      >
        <form onSubmit={handleAssign} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Active Technician
            </label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
            >
              <option value="">Choose a technician...</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.department || 'Maintenance'}) — {t._count?.assignedIssues || 0} active
                  tasks
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md disabled:opacity-50"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Resolve Issue Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Complete & Resolve Issue"
      >
        <form onSubmit={handleResolve} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Resolution Note * (Describe the repair, parts replaced, or action taken)
            </label>
            <textarea
              required
              rows={4}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Replaced burnt ballast and two 36W T8 fluorescent tubes. Verified proper illumination."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsResolveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md disabled:opacity-50"
            >
              Submit Resolution
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Reopen Issue Modal */}
      <Modal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        title="Request Ticket Reopening"
      >
        <form onSubmit={handleReopen} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reason for Reopening * (Explain why the resolution was incomplete)
            </label>
            <textarea
              required
              rows={4}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. The leak has returned under water pressure after the faucet was turned on."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsReopenModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-md disabled:opacity-50"
            >
              Confirm Reopen
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Cancel Issue Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Reported Issue"
      >
        <form onSubmit={handleCancel} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {modalError}
            </div>
          )}

          <p className="text-xs text-slate-400">
            Are you sure you want to cancel this report? This will mark the issue as CANCELLED.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cancellation Reason (Optional)
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Mistakenly logged duplicate ticket"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Keep Issue
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-md disabled:opacity-50"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
