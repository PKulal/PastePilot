import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PasteEditor from '../components/PasteEditor';
import { pasteAPI } from '../api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePaste = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data, isDraft) => {
    if (!data.content?.trim()) return toast.error('Content is required');
    setLoading(true);
    try {
      const res = await pasteAPI.createPaste({ ...data, isDraft });
      toast.success(isDraft ? 'Draft saved!' : 'Snippet published!');
      navigate(isDraft ? '/pastes?tab=draft' : `/paste/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-center mb-8">
        <Link to="/dashboard" className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <h1 className="font-inter text-2xl font-semibold text-on-surface">Create New Snippet</h1>
      </header>
      <PasteEditor onSubmit={handleSubmit} submitting={loading} mode="create" />
    </div>
  );
};

export default CreatePaste;
