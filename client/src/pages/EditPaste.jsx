import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import PasteEditor from '../components/PasteEditor';
import { pasteAPI } from '../api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const EditPaste = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paste, setPaste] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    pasteAPI.getPaste(id)
      .then((r) => {
        if (r.data.locked) { setError('This paste is password-protected and cannot be edited from here.'); return; }
        setPaste(r.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load paste'));
  }, [id]);

  const handleSubmit = async (data, isDraft) => {
    setLoading(true);
    try {
      await pasteAPI.updatePaste(id, { ...data, isDraft });
      toast.success('Paste updated!');
      navigate(`/paste/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="min-h-screen flex items-center justify-center text-error p-4">{error}</div>;
  if (!paste) return <div className="min-h-screen flex items-center justify-center text-primary">Loading…</div>;

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-center mb-8">
        <Link to={`/paste/${id}`} className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-colors">
          <ArrowLeft size={18} /> Back
        </Link>
        <h1 className="font-inter text-2xl font-semibold text-on-surface">Edit Snippet</h1>
      </header>
      <PasteEditor
        initial={{
          title: paste.title, description: paste.description, content: paste.content,
          language: paste.language, visibility: paste.visibility, tags: paste.tags,
          category: paste.category, burnAfterViews: paste.burnAfterViews,
        }}
        onSubmit={handleSubmit}
        submitting={loading}
        mode="edit"
      />
    </div>
  );
};

export default EditPaste;
