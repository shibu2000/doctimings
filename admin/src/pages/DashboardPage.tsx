import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  BadgeCheck,
  ArrowRight,
  Plus,
  Download,
  Calendar,
  Flag,
  UserCheck,
  ShieldCheck,
  Clock,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const DashboardPage: React.FC = () => {
  const { establishments, doctors, reports, overrides, auditLogs } = useAdmin();
  const navigate = useNavigate();

  const totalEstablishments = establishments.length;
  const verifiedEstablishments = establishments.filter(e => e.verificationStatus === 'Verified').length;
  const needsVerificationEstablishments = establishments.filter(e => e.verificationStatus !== 'Verified').length;
  const accountManagedEstablishments = establishments.filter(e => e.accountStatus === 'Account Active').length;
  const pendingReports = reports.filter(r => r.status === 'pending');
  const pendingDoctors = doctors.filter(d => d.verificationStatus !== 'Verified');
  const totalPendingActions = needsVerificationEstablishments + pendingReports.length + pendingDoctors.length;

  const exportSummaryCsv = () => {
    const csvContent = [
      'Type,Count',
      `Total Establishments,${totalEstablishments}`,
      `Verified Establishments,${verifiedEstablishments}`,
      `Pending Community Reports,${pendingReports.length}`,
      `Active Doctors,${doctors.length}`,
      `Active Overrides,${overrides.length}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wimd-ops-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
              Registry Live
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Manage healthcare information and keep it up to date across verified regional chambers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={exportSummaryCsv}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-teal-800 border border-slate-200 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>Export Summary</span>
          </button>
          <button
            onClick={() => navigate('/establishments/new')}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Establishment</span>
          </button>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Establishment Overview
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Updated just now · Ground Verification Node WB-04
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Total Establishments</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalEstablishments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Active Units</span>
              <span>in system registry</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Verified</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{verifiedEstablishments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold font-mono">
                {totalEstablishments > 0 ? ((verifiedEstablishments / totalEstablishments) * 100).toFixed(1) : 0}%
              </span>
              <span className="text-xs text-slate-500">verified accurate on ground</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Needs Verification</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">{needsVerificationEstablishments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-bold">
                Action Due
              </span>
              <span className="text-xs text-slate-500 truncate">Stale records (&gt;90d) & new</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Account Managed</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{accountManagedEstablishments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <BadgeCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                V1 Rollout
              </span>
              <span className="text-xs text-slate-500 truncate">Establishment-claimed accounts</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900">Needs attention</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  totalPendingActions > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {totalPendingActions} Total Pending Actions
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Actionable items requiring admin verification or ground review today.
              </p>
            </div>
            {totalPendingActions > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>High Priority Items</span>
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {totalPendingActions === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">All queues are clear</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  No pending verifications, community reports, or doctor profile updates require attention right now.
                </p>
              </div>
            ) : (
              <>
                {needsVerificationEstablishments > 0 && (
                  <div className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {needsVerificationEstablishments} establishment{needsVerificationEstablishments > 1 ? 's' : ''} need verification
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-semibold">
                            {needsVerificationEstablishments} Pending
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Physical address validation and chamber coordinate verification required.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate('/verification-queue')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-teal-800 border border-slate-200 hover:border-teal-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>Review Queue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {pendingReports.length > 0 && (
                  <div className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Flag className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {pendingReports.length} establishment report{pendingReports.length > 1 ? 's' : ''} waiting for review
                          </span>
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-semibold">
                            {pendingReports.length} Reports
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Community user reports regarding closed clinics, relocated chambers, or shifted doctor timings.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate('/reports')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-teal-800 border border-slate-200 hover:border-teal-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>Resolve Reports</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {pendingDoctors.length > 0 && (
                  <div className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {pendingDoctors.length} doctor profile{pendingDoctors.length > 1 ? 's' : ''} need verification
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-semibold">
                            {pendingDoctors.length} Profiles
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Missing WBMC registration confirmation or degrees record verification.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate('/verification-queue')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-teal-800 border border-slate-200 hover:border-teal-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>Verify Doctors</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-full">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Establishment onboarding</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Track onboarding pipeline from physical identification to digital verification.
                  </p>
                </div>
                <Building2 className="w-5 h-5 text-slate-400" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Total Enrolled</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold text-slate-900">{totalEstablishments}</span>
                    <span className="text-[10px] text-teal-700 font-semibold">In Registry</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Verified Units</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold text-slate-900">{verifiedEstablishments}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Audited</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Needs Review</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold text-slate-900">{needsVerificationEstablishments}</span>
                    <span className="text-[10px] text-amber-600 font-semibold">Pending</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Active Accounts</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold text-slate-900">{accountManagedEstablishments}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Claimed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/establishments/new')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-700 text-white hover:bg-teal-800 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Establishment</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/establishments')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span>View Directory</span>
                </button>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Preview: {Math.min(totalEstablishments, 3)} Active Units
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between overflow-x-auto">
              {totalEstablishments === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No establishments in registry</p>
                  <p className="text-xs text-slate-400 mt-0.5">Get started by creating your first clinic, chamber, or pharmacy entry.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/establishments/new')}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Establishment</span>
                  </button>
                </div>
              ) : (
                <>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                        <th className="pb-2">Establishment</th>
                        <th className="pb-2">Location / Type</th>
                        <th className="pb-2">Verification</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {establishments.slice(0, 3).map(est => (
                        <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                                {est.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 block truncate max-w-xs">{est.name}</span>
                                <span className="font-mono text-[10px] text-slate-400">{est.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-slate-600">
                            <div>{est.type}</div>
                            <div className="text-[10px] text-slate-400">{est.subDistrict}, {est.district}</div>
                          </td>
                          <td className="py-3 pr-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                est.verificationStatus === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {est.verificationStatus === 'Verified' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              <span>{est.verificationStatus}</span>
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => navigate(`/establishments/${est.id}`)}
                              className="text-teal-700 hover:underline font-semibold cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Showing {Math.min(totalEstablishments, 3)} of {totalEstablishments} registrations</span>
                    <button
                      type="button"
                      onClick={() => navigate('/establishments')}
                      className="text-teal-700 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect All ({totalEstablishments})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent activity</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Operational updates across entities & schedules.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live Feed</span>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {auditLogs.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <Clock className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No activity logged yet</p>
                    <p className="mt-0.5 text-slate-400">Actions taken across doctors and chambers will appear here in real time.</p>
                  </div>
                ) : (
                  auditLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 text-xs">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-slate-900 truncate">{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5 line-clamp-1">{log.entityName}</p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                          <span>{log.actorName}</span>
                          <span>·</span>
                          <span className="truncate">{log.details}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/audit-log')}
                className="w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 py-1 transition-colors cursor-pointer"
              >
                <span>View Complete Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Establishment accounts & self-management</h3>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    Future Integration
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Establishments can be invited to self-manage doctor rosters and chamber timings in subsequent rollout phases.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/establishments')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-teal-800 border border-slate-200 hover:bg-slate-50 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
            >
              <span>Manage Accounts</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">{accountManagedEstablishments} Active Accounts</span>
                <span className="text-[11px] text-slate-500 block">Managed by verified chemist desk</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">{establishments.filter(e => e.accountStatus === 'Invitation Pending').length} Invitations Pending</span>
                <span className="text-[11px] text-slate-500 block">Awaiting phone verification</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600 font-medium">Live Token & Rostering</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                Phase 2
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
