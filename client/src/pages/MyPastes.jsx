import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import PasteCard from '../components/PasteCard';
import { pasteAPI } from '../api';
import { Search, FileText, Trash2, Pencil, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['all', 'public', 'private', 'draft', 'archived', 'expired', 'favorites'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

const MyPastes = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'all';
  const [pastes, setPastes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState('newest');

  const setTab = (t) => setParams({ tab: t });

  const fetchPastes = async () => {
    setLoading(true);
    try {
      const res = await pasteAPI.getMyPastes({ tab, search, language, sort });
      setPastes(res.data);
    } catch (err) {
      toast.error('Failed to load pastes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPastes(); /* eslint-disable-next-line */ }, [tab, sort]);

  const onDelete = async (id) => {
    if (!window.confirm('Delete this paste?')) return;
    try { await pasteAPI.deletePaste(id); toast.success('Deleted'); fetchPastes(); }
    catch { toast.error('Delete failed'); }
  };
  const onArchive = async (id) => {
    try { await pasteAPI.archivePaste(id); toast.success('Archived'); fetchPastes(); }
    catch { toast.error('Archive failed'); }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="font-inter text-2xl font-semibold text-on-surface">My Pastes</h1>
          <Link to="/create" className="text-primary hover:underline text-sm">+ New Paste</Link>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 flex-wrap border-b border-outline-variant">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <form onSubmit={(e) => { e.preventDefault(); fetchPastes(); }} className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-on-surface-variant" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your pastes..."
              className="w-full bg-surface border border-outline-variant text-on-surface py-2 pl-10 pr-4 rounded focus:outline-none focus:border-primary" />
          </form>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} onBlur={fetchPastes}
            className="bg-surface border border-outline-variant text-on-surface px-3 rounded focus:border-primary outline-none">
            <option value="">All languages</option>
            {['javascript', 'python', 'typescript', 'html', 'css', 'json', 'sql', 'markdown'].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="bg-surface border border-outline-variant text-on-surface px-3 rounded focus:border-primary outline-none">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-primary text-center py-10">Loading pastes...</div>
        ) : pastes.length === 0 ? (
          <Card className="text-center py-16 text-on-surface-variant">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>No pastes in "{tab}".</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastes.map((p) => (
              <PasteCard key={p.id} paste={p} actions={
                <>
                  <Link to={`/edit/${p.id}`} className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary"><Pencil size={13} /> Edit</Link>
                  {!p.isArchived && <button onClick={() => onArchive(p.id)} className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-tertiary"><Archive size={13} /> Archive</button>}
                  <button onClick={() => onDelete(p.id)} className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-error ml-auto"><Trash2 size={13} /> Delete</button>
                </>
              } />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyPastes;
