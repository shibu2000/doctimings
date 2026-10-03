import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Stethoscope,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  Save,
  Quote,
  ShieldCheck
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ResolutionOutcome } from '../../types';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Radio } from '../../components/ui/Radio';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { reports, doctors, establishments, resolveReport, rejectReport } = useAdmin();
  const navigate = useNavigate();

  const report = reports.find(r => r.id === id) || reports[0];
  const doctor = doctors.find(d => d.id === report?.doctorId);
  const establishment = establishments.find(e => e.id === report?.establishmentId);

  const [verificationMethod, setVerificationMethod] = useState(
    report?.verificationMethod || 'Telephonic Call to Proprietor'
  );
  const [adminNotes, setAdminNotes] = useState(
    report?.adminNotes ||
      'Spoke directly with chemist Amit Kumar at 10:15 AM. Confirmed Dr. Das was delayed due to rural emergency surgery. He arrived at 6:15 PM and attended all patients.'
  );
  const [resolutionOutcome, setResolutionOutcome] = useState<ResolutionOutcome>(
    report?.resolutionOutcome || 'checked_no_change'
  );
  const [resolutionSummary, setResolutionSummary] = useState(
    report?.resolutionSummary ||
      'One-off transit delay due to emergency clinical call. Doctor completed chamber session from 6:15 PM to 8:30 PM. Weekly schedule slot remains valid and accurate. No recurring platform change warranted.'
  );

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isResolvedSuccess, setIsResolvedSuccess] = useState(report?.status === 'resolved');

  if (!report) {
    return <div className="p-8 text-slate-500">Report not found.</div>;
  }

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    resolveReport(report.id, {
      outcome: resolutionOutcome,
      notes: adminNotes,
      summary: resolutionSummary,
      method: verificationMethod
    });
    setIsResolvedSuccess(true);
  };

  const handleRejectConfirm = () => {
    rejectReport(report.id, 'Reported information invalid or contradictory to physical chemist log.');
    setIsRejectModalOpen(false);
    navigate('/reports');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col gap-1 pb-4 border-b border-slate-200">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <span onClick={() => navigate('/verification-queue')} className="hover:text-teal-700 cursor-pointer">
            Verification
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span onClick={() => navigate('/reports')} className="hover:text-teal-700 cursor-pointer">
            Reports
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-900 font-mono">Report #{report.id}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report #{report.id}</h1>
              <Badge
                variant={
                  report.status === 'pending'
                    ? 'warning'
                    : report.status === 'resolved'
                    ? 'success'
                    : 'neutral'
                }
                hasDot
              >
                {report.status} Review
              </Badge>
              <Badge variant="neutral">
                Signal Ref: {report.signalRef}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Submitted by Community · Flagged for operational discrepancy verification · Received {report.observedTimestamp}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRejectModalOpen(true)}
            >
              Reject Report
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleResolve}
            >
              Resolve Report
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-teal-950">
          <span className="font-bold uppercase tracking-wider block">Operational Governance Axiom</span>
          <p className="leading-relaxed text-teal-900/90">
            OPERATIONAL NOTICE: Community reports are treated as unverified field signals, not confirmed facts. Platform records must never be modified automatically. Field telephonic check or establishment proprietor confirmation is mandatory prior to status changes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Community Discrepancy Signal</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">Incident UUID: {report.incidentUuid}</span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reported Issue</span>
                  <p className="font-bold text-slate-900 mt-1">{report.issueTitle}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Classification</span>
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    Doctor unavailable
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Raw Community Submission
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <Quote className="w-5 h-5 text-teal-700 shrink-0 mt-0.5 opacity-60" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 italic">"{report.userQuote}"</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                      <span>Input: Public Patient Mobile Web</span>
                      <span>·</span>
                      <span>Territory: {report.reporterTerritory}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                <span>Affected Platform Entities</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold font-mono">
                Cross-Referenced
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                      {doctor?.fullName.slice(4, 6) || 'DR'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{doctor?.fullName}</h3>
                      <p className="text-xs text-slate-500">{doctor?.specialty}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">{doctor?.registrationNumber}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/doctors/${doctor?.id}`)}
                      className="text-teal-700 hover:underline font-bold"
                    >
                      View Doctor
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                      {establishment?.name.charAt(0) || 'E'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{establishment?.name}</h3>
                      <p className="text-xs text-slate-500 truncate">{establishment?.subDistrict}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">{establishment?.phone}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/establishments/${establishment?.id}`)}
                      className="text-teal-700 hover:underline font-bold"
                    >
                      View Chamber
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/70 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-700" />
                    <span className="font-bold text-slate-900">Customary Slot: Thursday · 5:00 PM – 7:00 PM</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/doctors/${doctor?.id}/schedule`)}
                    className="text-teal-800 font-bold hover:underline"
                  >
                    Update Doctor Schedule
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Crucial Explanatory Callout: A scheduled time reflects customary recurring hours and does not guarantee the doctor is physically present at the exact minute. Emergency patient rounds or hospital transit delays frequently occur in regional sectors.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-700" />
                <span>Verify Information & Reconciliation</span>
              </h2>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Ground Audit</span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-teal-800 uppercase text-[10px] tracking-wider block">
                    Current Platform Record
                  </span>
                  <div className="mt-2 space-y-1">
                    <p className="font-bold text-slate-900">Thursday, 5:00 PM – 7:00 PM</p>
                    <p className="text-slate-500">at Maa Medical Centre, Chamber 1</p>
                    <span className="text-emerald-700 font-semibold block text-[11px] pt-1">
                      Verified by Ops Admin on 12 Aug 2026
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-red-50/50 rounded-lg border border-red-200">
                  <span className="font-bold text-red-700 uppercase text-[10px] tracking-wider block">
                    Reported Information
                  </span>
                  <div className="mt-2 space-y-1">
                    <p className="font-bold text-slate-900">Doctor was not available during listed time</p>
                    <p className="text-red-700 font-medium">Incident date: Thursday, 25 Sep 2026</p>
                    <span className="text-slate-500 block text-[11px] pt-1">
                      Report source: Public Web Interface
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                  Verification Channel Executed *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Telephonic Call to Proprietor',
                    'Direct Doctor Contact',
                    'Field Agent Geo-Check',
                    'Other Telephonic Inquiry'
                  ].map(method => (
                    <div
                      key={method}
                      onClick={() => setVerificationMethod(method)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        verificationMethod === method
                          ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Radio
                        name="vMethod"
                        checked={verificationMethod === method}
                        onChange={() => setVerificationMethod(method)}
                        label={method}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 uppercase text-[10px] tracking-wider flex items-center justify-between">
                  <span>Admin Verification Notes</span>
                  <span className="font-mono text-slate-400">Internal audit record</span>
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600 font-medium leading-relaxed"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>Report Resolution Workflow</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">
                Stage 3 of 3
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                  Select Final Resolution Outcome *
                </span>
                <div className="space-y-2">
                  <div
                    onClick={() => setResolutionOutcome('confirmed_updated')}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      resolutionOutcome === 'confirmed_updated'
                        ? 'bg-teal-50 border-teal-600 text-teal-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Radio
                      name="rOutcome"
                      checked={resolutionOutcome === 'confirmed_updated'}
                      onChange={() => setResolutionOutcome('confirmed_updated')}
                      label="Information confirmed and updated"
                      description="Platform record has been updated with a temporary cancellation, schedule adjustment, or modified consultation hours."
                    />
                  </div>

                  <div
                    onClick={() => setResolutionOutcome('checked_no_change')}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      resolutionOutcome === 'checked_no_change'
                        ? 'bg-teal-50 border-teal-600 text-teal-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Radio
                      name="rOutcome"
                      checked={resolutionOutcome === 'checked_no_change'}
                      onChange={() => setResolutionOutcome('checked_no_change')}
                      label={
                        <div className="flex items-center gap-2">
                          <span>Information checked — no change required</span>
                          <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[10px] font-bold rounded">
                            Recommended
                          </span>
                        </div>
                      }
                      description="Existing recurring roster is accurate; e.g. doctor was present, was delayed briefly due to hospital transit, or patients were served in modified order."
                    />
                  </div>

                  <div
                    onClick={() => setResolutionOutcome('unverified')}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      resolutionOutcome === 'unverified'
                        ? 'bg-teal-50 border-teal-600 text-teal-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Radio
                      name="rOutcome"
                      checked={resolutionOutcome === 'unverified'}
                      onChange={() => setResolutionOutcome('unverified')}
                      label="Report could not be verified"
                      description="Insufficient ground evidence or unresponsive contacts after standardized operational attempts."
                    />
                  </div>

                  <div
                    onClick={() => setResolutionOutcome('incorrect')}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      resolutionOutcome === 'incorrect'
                        ? 'bg-teal-50 border-teal-600 text-teal-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Radio
                      name="rOutcome"
                      checked={resolutionOutcome === 'incorrect'}
                      onChange={() => setResolutionOutcome('incorrect')}
                      label="Report is incorrect"
                      description="Submitted information determined to be invalid, erroneous, or contradictory to physical logs."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                  Mandatory Resolution Summary *
                </label>
                <textarea
                  rows={3}
                  value={resolutionSummary}
                  onChange={e => setResolutionSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-mono">
                  Audit signature: Operations Admin ({new Date().toISOString().slice(0, 10)})
                </span>
                <button
                  type="button"
                  onClick={handleResolve}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isResolvedSuccess ? 'Resolved (Updated)' : 'Submit Resolution'}</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Source Record Actions</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Need to update platform data? Edit the source entity directly. Changes reflect immediately across public search.
            </p>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => navigate(`/doctors/${doctor?.id}/overrides`)}
                className="w-full p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="font-bold text-slate-900 block">Add Temporary Absence</span>
                  <span className="text-[11px] text-slate-500">1-day override for {doctor?.fullName}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => navigate(`/doctors/${doctor?.id}/schedule`)}
                className="w-full p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="font-bold text-slate-900 block">Edit Doctor Weekly Schedule</span>
                  <span className="text-[11px] text-slate-500">Recurring slots at {establishment?.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => navigate(`/establishments/${establishment?.id}`)}
                className="w-full p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="font-bold text-slate-900 block">Inspect Chamber Facility</span>
                  <span className="text-[11px] text-slate-500">Capacity & desk specifications</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Integrity Checklist</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-medium">Chamber schedule cross-referenced</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-medium">Proprietor / chemist contacted</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-medium">Audit note recorded</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        title="Reject Community Report?"
        message="Are you sure you want to discard this community signal? It will be marked as Rejected in the audit trail without altering any doctor or chamber schedule records."
        confirmLabel="Reject Report"
      />
    </div>
  );
};
