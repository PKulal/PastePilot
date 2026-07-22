import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import PasteCard from '../components/PasteCard';
import { pasteAPI } from '../api';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

const Favorites = () => {
  const [pastes, setPastes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    pasteAPI.getFavorites().then((r) => setPastes(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const unfav = async (id) => {
    try { await pasteAPI.toggleFavorite(id); toast.success('Removed from favorites'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="font-inter text-2xl font-semibold text-on-surface mb-6 flex items-center gap-2"><Star size={22} /> Favorites</h1>
        {loading ? (
          <div className="text-primary text-center py-10">Loading…</div>
        ) : pastes.length === 0 ? (
          <Card className="text-center py-16 text-on-surface-variant">
            <Star size={48} className="mx-auto mb-4 opacity-50" />
            <p>No favorites yet. Star pastes to save them here.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastes.map((p) => (
              <PasteCard key={p.id} paste={p} actions={
                <button onClick={() => unfav(p.id)} className="flex items-center gap-1 text-xs text-tertiary hover:brightness-125 ml-auto">
                  <Star size={13} fill="currentColor" /> Unfavorite
                </button>
              } />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Favorites;
