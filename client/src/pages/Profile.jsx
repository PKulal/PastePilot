import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { userAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      setUser(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <h1 className="font-inter text-2xl font-semibold text-on-surface mb-6">Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-4 text-primary overflow-hidden">
              {form.avatar ? <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={48} />}
            </div>
            <h2 className="font-inter font-semibold text-xl text-on-surface">{user.name}</h2>
            <p className="text-on-surface-variant text-sm mt-1">{user.email}</p>
            <div className="mt-3 px-3 py-1 bg-surface-container rounded-full text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{user.role}</div>
            <p className="text-xs text-on-surface-variant mt-3">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
          </Card>

          <Card className="md:col-span-2 flex flex-col gap-4">
            <h3 className="font-inter font-semibold text-lg text-primary border-b border-outline-variant pb-2">Edit Profile</h3>
            <Input label="Display Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email Address" value={user.email} disabled />
            <Input label="Avatar URL" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://…" />
            <div className="flex flex-col w-full">
              <label className="text-sm font-medium text-on-surface-variant mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
                className="input-field resize-none" placeholder="Tell us about yourself" />
            </div>
            <Button variant="primary" className="self-start mt-2" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
