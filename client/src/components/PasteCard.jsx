import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import { Eye, Lock, Clock, Tag } from 'lucide-react';

const statusColor = {
  ACTIVE: 'text-secondary',
  DRAFT: 'text-tertiary',
  EXPIRED: 'text-outline',
  BURNED: 'text-error',
};

// Reusable card for listing pastes. `actions` renders custom buttons in the footer.
const PasteCard = ({ paste, actions }) => (
  <Card className="flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(173,198,255,0.1)]">
    <Link to={`/paste/${paste.id}`} className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-inter font-semibold text-lg text-on-surface truncate">{paste.title}</h3>
        {paste.isProtected && <Lock size={16} className="text-tertiary shrink-0 mt-1" />}
      </div>
      {paste.description && (
        <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{paste.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant mt-3">
        <span className="flex items-center gap-1"><Clock size={13} /> {new Date(paste.createdAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-1"><Eye size={13} /> {paste.currentViews ?? 0}</span>
        <span className="px-2 py-0.5 bg-surface-container rounded uppercase tracking-wider">{paste.language}</span>
        {paste.status && paste.status !== 'ACTIVE' && (
          <span className={`uppercase font-semibold ${statusColor[paste.status] || ''}`}>{paste.status}</span>
        )}
      </div>
      {paste.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {paste.tags.slice(0, 4).map((t) => (
            <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-surface-container-high rounded text-on-surface-variant">
              <Tag size={10} /> {t}
            </span>
          ))}
        </div>
      )}
    </Link>
    {actions && <div className="flex items-center gap-2 pt-3 border-t border-outline-variant">{actions}</div>}
  </Card>
);

export default PasteCard;
