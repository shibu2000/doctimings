import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  Stethoscope,
  BookOpen,
  ArrowRight,
  Languages
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const HealthTopicsPage: React.FC = () => {
  const { healthTopics } = useAdmin();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Health Topics & Search Aliases</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold">
              Bilingual Taxonomy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Taxonomy mapping colloquial Bengali health concerns to formal medical specialties for patient search matching.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/health-guide')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
        >
          <BookOpen className="w-4 h-4 text-teal-700" />
          <span>View Health Guide Articles</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthTopics.map(topic => (
          <div
            key={topic.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                    <BookmarkCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{topic.nameEn}</h3>
                    <p className="text-xs text-teal-800 font-semibold">{topic.nameBn}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                  {topic.id}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Mapped Medical Specialty:</span>
                  <span className="font-bold text-slate-800">{topic.specialty}</span>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                    <Languages className="w-3 h-3 text-slate-400" />
                    <span>Colloquial Bengali Search Aliases</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {topic.colloquialBengaliTerms.map(term => (
                      <span
                        key={term}
                        className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {topic.articleCount} Educational Articles
              </span>
              <button
                type="button"
                onClick={() => navigate('/health-guide')}
                className="text-teal-700 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Browse Articles</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
