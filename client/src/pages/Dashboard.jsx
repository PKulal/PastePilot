import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { pasteAPI, announcementAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus, FileText, Eye, Globe, Lock, FileEdit, Archive, Clock, Flame, Activity, Megaphone, TrendingUp,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, accent = 'text-on-surface' }) => (
  <Card className="flex flex-col gap-1 relative overflow-hidden">
    <div className="absolute -right-3 -top-3 opacity-10"><Icon size={80} /></div>
    <span className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">{label}</span>
    <span className={`text-3xl font-inter font-bold ${accent}`}>{value}</span>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    pasteAPI.getDashboard().then((r) => setStats(r.data)).catch(() => {});
    announcementAPI.getActive().then((r) => setAnnouncements(r.data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-inter font-bold text-on-surface">Welcome back, {user?.name}</h1>
            <p className="text-on-surface-variant mt-1">Here's what's happening with your snippets.</p>
          </div>
          <Link to="/create"><Button variant="primary" className="flex items-center gap-2"><Plus size={18} /> New Paste</Button></Link>
        </header>

        {announcements.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-primary">
            <div className="flex items-center gap-2 text-primary mb-2"><Megaphone size={18} /><span className="font-semibold">Announcements</span></div>
            {announcements.map((a) => (
              <div key={a.id} className="mb-2 last:mb-0">
                <p className="font-medium text-on-surface">{a.title}</p>
                <p className="text-sm text-on-surface-variant">{a.message}</p>
              </div>
            ))}
          </Card>
        )}

        {!stats ? (
          <div className="text-primary">Loading stats…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={FileText} label="Total Pastes" value={stats.total} />
              <StatCard icon={Eye} label="Total Views" value={stats.totalViews} accent="text-secondary" />
              <StatCard icon={Globe} label="Public" value={stats.public} />
              <StatCard icon={Lock} label="Private" value={stats.private} />
              <StatCard icon={FileEdit} label="Drafts" value={stats.drafts} accent="text-tertiary" />
              <StatCard icon={Archive} label="Archived" value={stats.archived} />
              <StatCard icon={Clock} label="Expired" value={stats.expired} accent="text-outline" />
              <StatCard icon={Flame} label="Burned" value={stats.burned} accent="text-error" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-inter font-semibold text-on-surface mb-3 flex items-center gap-2"><TrendingUp size={18} /> Most Viewed</h2>
                <Card>
                  {stats.mostViewed ? (
                    <Link to={`/paste/${stats.mostViewed.id}`} className="flex justify-between items-center hover:text-primary">
                      <span className="font-medium text-on-surface truncate">{stats.mostViewed.title}</span>
                      <span className="text-secondary flex items-center gap-1"><Eye size={14} /> {stats.mostViewed.currentViews}</span>
                    </Link>
                  ) : <p className="text-on-surface-variant text-sm">No pastes yet.</p>}
                </Card>
              </div>

              <div>
                <h2 className="text-lg font-inter font-semibold text-on-surface mb-3 flex items-center gap-2"><Activity size={18} /> Recent Activity</h2>
                <Card className="p-0 overflow-hidden">
                  {stats.recentActivity?.length ? (
                    <ul className="divide-y divide-outline-variant">
                      {stats.recentActivity.map((a) => (
                        <li key={a.id} className="flex justify-between items-center px-5 py-3 text-sm">
                          <span className="text-on-surface">{a.action.replace(/_/g, ' ')}{a.meta ? ` — ${a.meta}` : ''}</span>
                          <span className="text-on-surface-variant text-xs">{new Date(a.createdAt).toLocaleTimeString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <div className="p-6 text-center text-on-surface-variant text-sm">No recent activity.</div>}
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
