import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import PasteCard from '../components/PasteCard';
import { pasteAPI } from '../api';
import { Archive, RotateCcw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Archived = () => {
  const [pastes, setPastes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    pasteAPI.getMyPastes({ tab: 'archived' }).then((r) => setPastes(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const restore = async (id) => {
    try { await pasteAPI.restorePaste(id); toast.success('Restored'); load(); }
    catch { toast.error('Restore failed'); }
  };
  const remove = async (id) => {
    if (!window.confirm('Permanently delete this paste?')) return;
    try { await pasteAPI.deletePaste(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="font-inter text-2xl font-semibold text-on-surface mb-6 flex items-center gap-2"><Archive size={22} /> Archived</h1>
        {loading ? (
          <div className="text-primary text-center py-10">Loading…</div>
        ) : pastes.length === 0 ? (
          <Card className="text-center py-16 text-on-surface-variant">
            <Archive size={48} className="mx-auto mb-4 opacity-50" />
            <p>No archived pastes.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastes.map((p) => (
              <PasteCard key={p.id} paste={p} actions={
                <>
                  <button onClick={() => restore(p.id)} className="flex items-center gap-1 text-xs text-secondary hover:brightness-125"><RotateCcw size={13} /> Restore</button>
                  <button onClick={() => remove(p.id)} className="flex items-center gap-1 text-xs text-error hover:brightness-125 ml-auto"><Trash2 size={13} /> Delete</button>
                </>
              } />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Archived;
