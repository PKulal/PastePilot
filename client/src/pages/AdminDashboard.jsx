import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { adminAPI } from '../api';
import { Users, FileText, Flag, Megaphone, Trash2, Check, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['stats', 'users', 'pastes', 'reports', 'announcements'];

const AdminDashboard = () => {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pastes, setPastes] = useState([]);
  const [reports, setReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [ann, setAnn] = useState({ title: '', message: '' });

  const loadStats = () => adminAPI.getStats().then((r) => setStats(r.data)).catch(() => {});
  const loadUsers = () => adminAPI.listUsers().then((r) => setUsers(r.data)).catch(() => {});
  const loadPastes = () => adminAPI.listPastes().then((r) => setPastes(r.data)).catch(() => {});
  const loadReports = () => adminAPI.listReports().then((r) => setReports(r.data)).catch(() => {});
  const loadAnn = () => adminAPI.listAnnouncements().then((r) => setAnnouncements(r.data)).catch(() => {});

  useEffect(() => {
    if (tab === 'stats') loadStats();
    if (tab === 'users') loadUsers();
    if (tab === 'pastes') loadPastes();
    if (tab === 'reports') loadReports();
    if (tab === 'announcements') loadAnn();
  }, [tab]);

  const setRole = async (id, role) => { try { await adminAPI.updateUserRole(id, role); toast.success('Role updated'); loadUsers(); } catch { toast.error('Failed'); } };
  const delUser = async (id) => { if (!window.confirm('Delete user and all their pastes?')) return; try { await adminAPI.deleteUser(id); toast.success('User deleted'); loadUsers(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); } };
  const delPaste = async (id) => { if (!window.confirm('Remove this paste?')) return; try { await adminAPI.deletePaste(id); toast.success('Removed'); loadPastes(); } catch { toast.error('Failed'); } };
  const resolve = async (id) => { try { await adminAPI.resolveReport(id); toast.success('Resolved'); loadReports(); } catch { toast.error('Failed'); } };
  const createAnn = async () => { if (!ann.title || !ann.message) return toast.error('Title and message required'); try { await adminAPI.createAnnouncement(ann); toast.success('Posted'); setAnn({ title: '', message: '' }); loadAnn(); } catch { toast.error('Failed'); } };
  const delAnn = async (id) => { try { await adminAPI.deleteAnnouncement(id); toast.success('Deleted'); loadAnn(); } catch { toast.error('Failed'); } };

  const StatCard = ({ icon: Icon, label, value }) => (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-on-surface-variant text-xs uppercase tracking-wider"><Icon size={14} /> {label}</div>
      <span className="text-3xl font-bold text-on-surface">{value}</span>
    </Card>
  );

  const th = 'text-left text-xs uppercase tracking-wider text-on-surface-variant px-4 py-2';
  const td = 'px-4 py-2 text-sm text-on-surface';

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="font-inter text-2xl font-semibold text-on-surface mb-6 flex items-center gap-2"><Shield size={22} /> Admin Panel</h1>

        <div className="flex gap-1 mb-6 flex-wrap border-b border-outline-variant">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${tab === t ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'}`}>{t}</button>
          ))}
        </div>

        {tab === 'stats' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Users" value={stats.users} />
            <StatCard icon={FileText} label="Pastes" value={stats.pastes} />
            <StatCard icon={FileText} label="Public" value={stats.publicPastes} />
            <StatCard icon={FileText} label="Private" value={stats.privatePastes} />
            <StatCard icon={Flag} label="Reports" value={stats.reports} />
            <StatCard icon={Flag} label="Open Reports" value={stats.openReports} />
            <StatCard icon={FileText} label="Total Views" value={stats.totalViews} />
          </div>
        )}

        {tab === 'users' && (
          <Card className="p-0 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead><tr className="border-b border-outline-variant"><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Role</th><th className={th}>Pastes</th><th className={th}>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-outline-variant/50">
                    <td className={td}>{u.name}</td>
                    <td className={td}>{u.email}</td>
                    <td className={td}>
                      <select value={u.role} onChange={(e) => setRole(u.id, e.target.value)} className="bg-surface border border-outline-variant rounded p-1 text-xs">
                        <option value="USER">USER</option><option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className={td}>{u._count?.pastes ?? 0}</td>
                    <td className={td}><button onClick={() => delUser(u.id)} className="text-error hover:brightness-125"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'pastes' && (
          <Card className="p-0 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead><tr className="border-b border-outline-variant"><th className={th}>Title</th><th className={th}>Author</th><th className={th}>Visibility</th><th className={th}>Status</th><th className={th}>Views</th><th className={th}></th></tr></thead>
              <tbody>
                {pastes.map((p) => (
                  <tr key={p.id} className="border-b border-outline-variant/50">
                    <td className={td}><a href={`/paste/${p.id}`} className="hover:text-primary">{p.title}</a></td>
                    <td className={td}>{p.author?.name || 'Anonymous'}</td>
                    <td className={td}>{p.visibility}</td>
                    <td className={td}>{p.status}</td>
                    <td className={td}>{p.currentViews}</td>
                    <td className={td}><button onClick={() => delPaste(p.id)} className="text-error hover:brightness-125"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'reports' && (
          <div className="flex flex-col gap-3">
            {reports.length === 0 && <Card className="text-center py-10 text-on-surface-variant">No reports.</Card>}
            {reports.map((r) => (
              <Card key={r.id} className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-error font-semibold text-sm">{r.reason}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${r.status === 'OPEN' ? 'bg-tertiary/20 text-tertiary' : 'bg-secondary/20 text-secondary'}`}>{r.status}</span>
                  </div>
                  <p className="text-sm text-on-surface mt-1">Paste: <a href={`/paste/${r.paste?.id}`} className="text-primary hover:underline">{r.paste?.title || 'deleted'}</a></p>
                  {r.details && <p className="text-xs text-on-surface-variant mt-1">{r.details}</p>}
                  <p className="text-xs text-on-surface-variant mt-1">By {r.reporter?.name || 'Guest'} · {new Date(r.createdAt).toLocaleString()}</p>
                </div>
                {r.status === 'OPEN' && <Button variant="secondary" onClick={() => resolve(r.id)} className="flex items-center gap-1 text-sm"><Check size={14} /> Resolve</Button>}
              </Card>
            ))}
          </div>
        )}

        {tab === 'announcements' && (
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-3">
              <h3 className="font-semibold text-primary flex items-center gap-2"><Megaphone size={18} /> New Announcement</h3>
              <Input label="Title" value={ann.title} onChange={(e) => setAnn({ ...ann, title: e.target.value })} />
              <textarea value={ann.message} onChange={(e) => setAnn({ ...ann, message: e.target.value })} rows={2} placeholder="Message" className="input-field resize-none" />
              <Button variant="primary" className="self-start" onClick={createAnn}>Post Announcement</Button>
            </Card>
            {announcements.map((a) => (
              <Card key={a.id} className="flex items-center justify-between">
                <div><p className="font-medium text-on-surface">{a.title}</p><p className="text-sm text-on-surface-variant">{a.message}</p></div>
                <button onClick={() => delAnn(a.id)} className="text-error hover:brightness-125"><Trash2 size={16} /></button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
