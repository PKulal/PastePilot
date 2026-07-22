import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { userAPI, authAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Palette, KeyRound, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    theme: user?.theme || 'DARK',
    defaultVisibility: user?.defaultVisibility || 'PUBLIC',
    defaultExpiration: user?.defaultExpiration || 'NEVER',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const select = 'bg-surface border border-outline-variant text-on-surface p-2 rounded focus:border-primary outline-none w-full';

  const savePrefs = async () => {
    setSavingPrefs(true);
    try { const res = await userAPI.updateSettings(prefs); setUser(res.data); toast.success('Preferences saved!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPrefs(false); }
  };

  const changePassword = async () => {
    if (pw.newPassword !== pw.confirm) return toast.error('Passwords do not match');
    setSavingPw(true);
    try {
      await userAPI.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed!');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  const logoutAll = async () => {
    try { await authAPI.logoutAll(); localStorage.removeItem('token'); toast.success('Logged out of all devices'); navigate('/login'); }
    catch { toast.error('Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl">
        <h1 className="font-inter text-2xl font-semibold text-on-surface mb-6">Settings</h1>

        <Card className="flex flex-col gap-4 mb-6">
          <h3 className="font-inter font-semibold text-lg text-primary border-b border-outline-variant pb-2 flex items-center gap-2"><Palette size={18} /> Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-on-surface-variant mb-1 block">Theme</label>
              <select value={prefs.theme} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value })} className={select}>
                <option value="DARK">Dark</option>
                <option value="LIGHT">Light</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface-variant mb-1 block">Default Visibility</label>
              <select value={prefs.defaultVisibility} onChange={(e) => setPrefs({ ...prefs, defaultVisibility: e.target.value })} className={select}>
                <option value="PUBLIC">Public</option>
                <option value="UNLISTED">Unlisted</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface-variant mb-1 block">Default Expiration</label>
              <select value={prefs.defaultExpiration} onChange={(e) => setPrefs({ ...prefs, defaultExpiration: e.target.value })} className={select}>
                <option value="NEVER">Never</option>
                <option value="10_MINUTES">10 Minutes</option>
                <option value="1_HOUR">1 Hour</option>
                <option value="1_DAY">1 Day</option>
                <option value="7_DAYS">7 Days</option>
                <option value="30_DAYS">30 Days</option>
              </select>
            </div>
          </div>
          <Button variant="primary" className="self-start" onClick={savePrefs} disabled={savingPrefs}>{savingPrefs ? 'Saving…' : 'Save Preferences'}</Button>
        </Card>

        <Card className="flex flex-col gap-4 mb-6">
          <h3 className="font-inter font-semibold text-lg text-primary border-b border-outline-variant pb-2 flex items-center gap-2"><KeyRound size={18} /> Change Password</h3>
          <Input label="Current Password" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <Input label="New Password" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <Input label="Confirm New Password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          <Button variant="primary" className="self-start" onClick={changePassword} disabled={savingPw}>{savingPw ? 'Updating…' : 'Update Password'}</Button>
        </Card>

        <Card className="flex flex-col gap-3">
          <h3 className="font-inter font-semibold text-lg text-error border-b border-outline-variant pb-2 flex items-center gap-2"><LogOut size={18} /> Security</h3>
          <p className="text-sm text-on-surface-variant">Sign out of all devices where your account is currently logged in.</p>
          <Button variant="secondary" className="self-start" onClick={logoutAll}>Log out all devices</Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
