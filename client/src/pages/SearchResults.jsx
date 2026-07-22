import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import PasteCard from '../components/PasteCard';
import { pasteAPI } from '../api';
import { Search as SearchIcon, TrendingUp } from 'lucide-react';

const SearchResults = () => {
  const [filters, setFilters] = useState({ query: '', language: '', tags: '', category: '', author: '', sort: 'newest' });
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => { pasteAPI.getTrending().then((r) => setTrending(r.data)).catch(() => {}); }, []);

  const run = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await pasteAPI.searchPastes(clean);
      setResults(res.data);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const input = 'bg-surface border border-outline-variant text-on-surface p-2 rounded focus:border-primary outline-none';

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="font-inter text-2xl font-semibold text-on-surface mb-6 flex items-center gap-2"><SearchIcon size={22} /> Search Pastes</h1>

        <Card className="mb-6">
          <form onSubmit={run} className="flex flex-col gap-3">
            <input value={filters.query} onChange={set('query')} placeholder="Search title, content, description…" className={input + ' text-lg'} autoFocus />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select value={filters.language} onChange={set('language')} className={input}>
                <option value="">Any language</option>
                {['javascript', 'python', 'typescript', 'html', 'css', 'json', 'sql', 'markdown', 'go', 'rust'].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <input value={filters.tags} onChange={set('tags')} placeholder="Tags (comma sep)" className={input} />
              <input value={filters.category} onChange={set('category')} placeholder="Category" className={input} />
              <input value={filters.author} onChange={set('author')} placeholder="Author name" className={input} />
            </div>
            <div className="flex gap-3 items-center">
              <select value={filters.sort} onChange={set('sort')} className={input}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <button type="submit" className="btn btn-primary flex items-center gap-2 ml-auto"><SearchIcon size={16} /> Search</button>
            </div>
          </form>
        </Card>

        {loading ? (
          <div className="text-primary text-center py-10">Searching…</div>
        ) : searched ? (
          results.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((p) => <PasteCard key={p.id} paste={p} />)}
            </div>
          ) : (
            <Card className="text-center py-16 text-on-surface-variant">No results found.</Card>
          )
        ) : (
          <>
            <h2 className="text-lg font-inter font-semibold text-on-surface mb-4 flex items-center gap-2"><TrendingUp size={18} /> Trending Now</h2>
            {trending.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trending.map((p) => <PasteCard key={p.id} paste={p} />)}
              </div>
            ) : <Card className="text-center py-10 text-on-surface-variant">No trending pastes yet.</Card>}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SearchResults;
