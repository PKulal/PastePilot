import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { pasteAPI, reportAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, Clock, Eye, Share2, Copy, Download, Star, QrCode, Flag,
  Pencil, Trash2, Archive, CopyPlus, Lock, Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

const REPORT_REASONS = ['SPAM', 'ABUSE', 'MALWARE', 'COPYRIGHT', 'OTHER'];

const ViewPaste = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paste, setPaste] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [qr, setQr] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportDetails, setReportDetails] = useState('');

  const isOwner = user && paste && user.id === paste.authorId;

  const load = async () => {
    try {
      const res = await pasteAPI.getPaste(id);
      setPaste(res.data);
      if (user && !res.data.locked) {
        pasteAPI.isFavorited(id).then((r) => setFavorited(r.data.favorited)).catch(() => {});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Paste not found or has expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const unlock = async (e) => {
    e.preventDefault();
    try {
      const res = await pasteAPI.unlockPaste(id, password);
      setPaste(res.data);
      toast.success('Unlocked!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect password');
    }
  };

  const toggleFav = async () => {
    try {
      const res = await pasteAPI.toggleFavorite(id);
      setFavorited(res.data.favorited);
      toast.success(res.data.favorited ? 'Added to favorites' : 'Removed from favorites');
    } catch { toast.error('Please log in to favorite'); }
  };

  const showQr = async () => {
    try { const res = await pasteAPI.getQr(id); setQr(res.data.qr); } catch { toast.error('Could not generate QR'); }
  };

  const doDelete = async () => {
    if (!window.confirm('Permanently delete this paste?')) return;
    try { await pasteAPI.deletePaste(id); toast.success('Deleted'); navigate('/pastes'); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const doArchive = async () => {
    try { await pasteAPI.archivePaste(id); toast.success('Archived'); navigate('/pastes'); }
    catch (err) { toast.error(err.response?.data?.message || 'Archive failed'); }
  };

  const doDuplicate = async () => {
    try { const res = await pasteAPI.duplicatePaste(id); toast.success('Duplicated'); navigate(`/paste/${res.data.id}`); }
    catch (err) { toast.error(err.response?.data?.message || 'Please log in to duplicate'); }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await reportAPI.create({ pasteId: id, reason: reportReason, details: reportDetails });
      toast.success('Report submitted. Thank you.');
      setShowReport(false); setReportDetails('');
    } catch { toast.error('Could not submit report'); }
  };

  const download = (format) => {
    window.open(pasteAPI.downloadUrl(id, format), '_blank');
    setShowDownload(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Loading Paste...</div>;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <h2 className="text-2xl font-inter text-error mb-2">Unavailable</h2>
          <p className="text-on-surface-variant mb-6">{error}</p>
          <Link to="/" className="text-primary hover:underline">Return Home</Link>
        </Card>
      </div>
    );
  }

  // Password-protected, not yet unlocked
  if (paste.locked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <Lock size={40} className="mx-auto mb-3 text-tertiary" />
          <h2 className="text-2xl font-inter text-on-surface mb-1">{paste.title}</h2>
          <p className="text-on-surface-variant mb-6 text-sm">This paste is password-protected.</p>
          <form onSubmit={unlock} className="flex flex-col gap-3">
            <Input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-0" autoFocus />
            <Button variant="primary" type="submit" className="w-full">Unlock</Button>
          </form>
          <Link to="/" className="text-primary hover:underline text-sm mt-4 inline-block">Return Home</Link>
        </Card>
      </div>
    );
  }

  const IconBtn = ({ onClick, title, children, active }) => (
    <button onClick={onClick} title={title}
      className={`p-2 rounded transition-colors ${active ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`}>
      {children}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <Link to={user ? '/dashboard' : '/'} className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-colors">
          <ArrowLeft size={18} /> Back
        </Link>
        <div className="flex gap-2 flex-wrap items-center">
          <IconBtn title="Copy content" onClick={() => { navigator.clipboard.writeText(paste.content); toast.success('Copied!'); }}><Copy size={18} /></IconBtn>
          <IconBtn title="Share URL" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}><Share2 size={18} /></IconBtn>
          <div className="relative">
            <IconBtn title="Download" onClick={() => setShowDownload((s) => !s)}><Download size={18} /></IconBtn>
            {showDownload && (
              <div className="absolute right-0 mt-1 bg-surface-container-high border border-outline-variant rounded shadow-lg z-10 overflow-hidden">
                {['txt', 'md', 'json'].map((f) => (
                  <button key={f} onClick={() => download(f)} className="block w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container uppercase">{f}</button>
                ))}
              </div>
            )}
          </div>
          <IconBtn title="QR Code" onClick={showQr}><QrCode size={18} /></IconBtn>
          {user && <IconBtn title="Favorite" onClick={toggleFav} active={favorited}><Star size={18} fill={favorited ? 'currentColor' : 'none'} /></IconBtn>}
          {user && <IconBtn title="Duplicate" onClick={doDuplicate}><CopyPlus size={18} /></IconBtn>}
          <IconBtn title="Report" onClick={() => setShowReport(true)}><Flag size={18} /></IconBtn>
          {isOwner && (
            <>
              <Link to={`/edit/${id}`}><IconBtn title="Edit"><Pencil size={18} /></IconBtn></Link>
              <IconBtn title="Archive" onClick={doArchive}><Archive size={18} /></IconBtn>
              <IconBtn title="Delete" onClick={doDelete}><Trash2 size={18} /></IconBtn>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <Card className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 px-6 gap-4">
          <div>
            <h1 className="font-inter text-2xl font-semibold text-on-surface">{paste.title}</h1>
            {paste.description && <p className="text-on-surface-variant text-sm mt-1">{paste.description}</p>}
            <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-2 flex-wrap">
              <span className="flex items-center gap-1"><Clock size={14} /> {new Date(paste.createdAt).toLocaleString()}</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {paste.currentViews} Views</span>
              <span className="px-2 py-1 bg-surface-container rounded uppercase tracking-wider">{paste.language}</span>
              {paste.author && <span className="text-primary">By {paste.author.name}</span>}
              {paste.tags?.map((t) => <span key={t} className="flex items-center gap-1"><Tag size={11} /> {t}</span>)}
            </div>
          </div>
          {paste.expiresAt && (
            <div className="text-tertiary text-sm font-semibold flex items-center gap-1 bg-tertiary/10 px-3 py-1 rounded">
              <Clock size={16} /> Expires {new Date(paste.expiresAt).toLocaleDateString()}
            </div>
          )}
        </Card>

        <Card className="flex-1 min-h-[600px] p-0 overflow-hidden border-outline-variant">
          <Editor height="600px" theme="vs-dark" language={paste.language} value={paste.content}
            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, fontFamily: 'Inter, monospace', padding: { top: 16 } }} />
        </Card>
      </div>

      {/* QR modal */}
      {qr && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setQr(null)}>
          <Card className="text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-inter font-semibold text-on-surface mb-3">Scan to open</h3>
            <img src={qr} alt="QR code" className="mx-auto rounded bg-white p-2" width={240} height={240} />
            <button onClick={() => setQr(null)} className="text-primary hover:underline text-sm mt-4">Close</button>
          </Card>
        </div>
      )}

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowReport(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-inter font-semibold text-on-surface mb-4 flex items-center gap-2"><Flag size={18} /> Report Paste</h3>
            <form onSubmit={submitReport} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Reason</label>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="bg-surface border border-outline-variant text-on-surface p-2 rounded outline-none focus:border-primary">
                  {REPORT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} rows={3} placeholder="Additional details (optional)"
                className="bg-surface border border-outline-variant text-on-surface p-2 rounded outline-none focus:border-primary resize-none" />
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" type="button" onClick={() => setShowReport(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Submit Report</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ViewPaste;
