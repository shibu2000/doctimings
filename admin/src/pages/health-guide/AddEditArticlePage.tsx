import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen,
  Save,
  ShieldCheck,
  Stethoscope,
  Trash2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

export const AddEditArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { articles, healthTopics, addArticle, updateArticle } = useAdmin();
  const navigate = useNavigate();

  const existing = articles.find(a => a.id === id);

  const [title, setTitle] = useState(existing?.title || '');
  const [selectedTopicId, setSelectedTopicId] = useState(existing?.topicId || healthTopics[0]?.id || '');
  const [language, setLanguage] = useState<'EN' | 'BN' | 'BOTH'>(existing?.language || 'BOTH');
  const [excerpt, setExcerpt] = useState(existing?.excerpt || '');
  const [bodyContent, setBodyContent] = useState(existing?.bodyContent || '');
  const [whenToSeeDoctor, setWhenToSeeDoctor] = useState<string[]>(
    existing?.whenToSeeDoctor || [
      'Symptoms persist beyond 3 days without improvement',
      'Accompanied by high fever (>101°F) or severe dehydration',
      'Sudden onset of severe pain, dizziness, or confusion'
    ]
  );
  const [newThreshold, setNewThreshold] = useState('');
  const [status, setStatus] = useState<'Published' | 'Draft' | 'Archived'>(existing?.status || 'Published');

  const selectedTopic = healthTopics.find(t => t.id === selectedTopicId);

  const handleAddThreshold = () => {
    if (newThreshold.trim()) {
      setWhenToSeeDoctor([...whenToSeeDoctor, newThreshold.trim()]);
      setNewThreshold('');
    }
  };

  const handleRemoveThreshold = (index: number) => {
    setWhenToSeeDoctor(whenToSeeDoctor.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedTopic) return;

    if (existing) {
      updateArticle(existing.id, {
        title: title.trim(),
        topicId: selectedTopic.id,
        topicName: selectedTopic.nameEn,
        language,
        targetSpecialty: selectedTopic.specialty,
        excerpt: excerpt.trim(),
        bodyContent: bodyContent.trim(),
        whenToSeeDoctor,
        status
      });
    } else {
      addArticle({
        title: title.trim(),
        topicId: selectedTopic.id,
        topicName: selectedTopic.nameEn,
        language,
        targetSpecialty: selectedTopic.specialty,
        excerpt: excerpt.trim(),
        bodyContent: bodyContent.trim(),
        whenToSeeDoctor,
        status
      });
    }

    navigate('/health-guide');
  };

  const topicOptions = healthTopics.map(t => ({
    value: t.id,
    label: `${t.nameEn} (${t.specialty})`
  }));

  const languageOptions = [
    { value: 'BOTH', label: 'Bilingual Parallel (EN + BN)' },
    { value: 'BN', label: 'Bengali Only (বাংলা)' },
    { value: 'EN', label: 'English Only (EN)' }
  ];

  const statusOptions = [
    { value: 'Published', label: 'Published (Live to Patients)' },
    { value: 'Draft', label: 'Draft (Editorial Review)' },
    { value: 'Archived', label: 'Archived' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <span onClick={() => navigate('/health-guide')} className="hover:text-teal-700 cursor-pointer">
              Health Guide
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-900">
              {existing ? 'Edit Article' : 'Create Educational Article'}
            </span>
          </nav>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {existing ? existing.title : 'New Educational Article'}
            </h1>
            <Badge variant={status === 'Published' ? 'success' : 'warning'}>
              {status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/health-guide')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save Article
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <p className="text-xs text-teal-900 leading-relaxed">
          Articles must remain strictly non-diagnostic. Every article automatically binds the standard <strong>“When to See a Doctor”</strong> threshold list and links to registered practitioners of the appropriate specialty.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <Input
            label="Article Title (English or Bengali)"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. When Should You See a Skin Doctor (Dermatologist)?"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Health Topic"
              required
              value={selectedTopicId}
              onChange={e => setSelectedTopicId(e.target.value)}
              options={topicOptions}
            />

            <Select
              label="Language Mode"
              required
              value={language}
              onChange={e => setLanguage(e.target.value as 'EN' | 'BN' | 'BOTH')}
              options={languageOptions}
            />

            <Select
              label="Publication Status"
              value={status}
              onChange={e => setStatus(e.target.value as 'Published' | 'Draft' | 'Archived')}
              options={statusOptions}
            />
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-slate-700">Short Summary / Excerpt</label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Plain language overview for search card results..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-slate-700">Detailed Educational Content</label>
            <textarea
              rows={8}
              value={bodyContent}
              onChange={e => setBodyContent(e.target.value)}
              placeholder="Explain signs, non-medicinal supportive care (hydration, rest), and the specialized doctor type..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 leading-relaxed font-sans"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span>Mandatory Clinical Guardrail: “When to See a Doctor”</span>
            </h2>
            <Badge variant="teal">Mandatory Section</Badge>
          </div>

          <p className="text-xs text-slate-500">
            Bullet points shown in a high-contrast emergency warning box advising patient escalation thresholds.
          </p>

          <div className="space-y-2 text-xs">
            {whenToSeeDoctor.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-700 shrink-0"></span>
                  <span className="text-slate-800">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveThreshold(index)}
                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-2">
              <Input
                value={newThreshold}
                onChange={e => setNewThreshold(e.target.value)}
                placeholder="Add critical threshold symptom..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddThreshold}
              >
                + Add Sign
              </Button>
            </div>
          </div>

          <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-teal-900 font-medium">
              <Stethoscope className="w-4 h-4 text-teal-700" />
              <span>Patient Call-to-Action: “Find qualified {selectedTopic?.specialty} doctors near you”</span>
            </div>
            <span className="font-mono text-[10px] text-teal-700 font-bold uppercase">Dynamic Link</span>
          </div>
        </div>
      </form>
    </div>
  );
};
