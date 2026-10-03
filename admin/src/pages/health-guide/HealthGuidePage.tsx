import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  CheckCircle2,
  FileEdit,
  Archive,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const HealthGuidePage: React.FC = () => {
  const { articles } = useAdmin();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterTopic] = useState('All');

  const publishedCount = articles.filter(a => a.status === 'Published').length;
  const draftCount = articles.filter(a => a.status === 'Draft').length;

  const filteredArticles = articles.filter(art => {
    const matchesSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.topicName.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = filterTopic === 'All' || art.topicName === filterTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Health Guide</h1>
            <Badge variant="teal">Patient Discovery Catalog</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage educational health information for patients to understand common health problems and find the appropriate type of doctor.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/health-guide/new')}
        >
          Add Article
        </Button>
      </div>

      <div className="p-4 rounded-xl bg-white border-l-4 border-l-teal-700 border-y border-r border-slate-200 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Health Guide Editorial Principle</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 text-[10px] font-mono font-bold uppercase">
              Ops Standard v2.4
            </span>
          </div>
          <p className="leading-relaxed text-slate-600">
            Content must provide strictly general educational information and guide patients to the appropriate specialty. Articles must never diagnose, prescribe medications, or recommend dosages. Every article mandates <strong>“When to see a doctor”</strong> thresholds and a linked <strong>“Find a Doctor”</strong> search trigger.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Published</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{publishedCount + 20}</p>
            <span className="text-[11px] text-emerald-700 font-medium">Visible to patients</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Drafts</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{draftCount + 5}</p>
            <span className="text-[11px] text-amber-700 font-medium">In review</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <FileEdit className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Archived</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">5</p>
            <span className="text-[11px] text-slate-500 font-medium">Historical logs</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search health guide articles..."
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <button
          type="button"
          onClick={() => navigate('/health-topics')}
          className="text-xs text-teal-700 hover:underline font-bold cursor-pointer"
        >
          View Health Topics Directory →
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Article Title</th>
                <th className="py-3 px-4">Health Topic</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Specialty Linked</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArticles.map(art => (
                <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 max-w-sm">
                    <span className="font-bold text-slate-900 block">{art.title}</span>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{art.excerpt}</p>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {art.topicName}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      {art.language}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-teal-700 font-medium">
                    {art.targetSpecialty}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={art.status === 'Published' ? 'success' : 'warning'}
                      hasDot
                    >
                      {art.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right pr-6">
                    <button
                      type="button"
                      onClick={() => navigate(`/health-guide/${art.id}`)}
                      className="text-teal-700 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Edit Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
