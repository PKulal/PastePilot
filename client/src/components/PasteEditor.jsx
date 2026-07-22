import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Settings2, Save, FileEdit, Eye } from 'lucide-react';

const LANGUAGES = ['plaintext', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php', 'ruby', 'html', 'css', 'json', 'sql', 'markdown', 'yaml', 'bash'];

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const selectCls = 'bg-surface border border-outline-variant text-on-surface p-2 rounded outline-none focus:border-primary';

// Shared create/edit form. `initial` seeds values; `onSubmit(data, isDraft)` handles persistence.
const PasteEditor = ({ initial = {}, onSubmit, submitting, mode = 'create' }) => {
  const [content, setContent] = useState(initial.content ?? '// Write your code here...');
  const [form, setForm] = useState({
    title: initial.title ?? '',
    description: initial.description ?? '',
    language: initial.language ?? 'javascript',
    visibility: initial.visibility ?? 'PUBLIC',
    expiration: initial.expiration ?? 'NEVER',
    burnAfterViews: initial.burnAfterViews ?? '',
    tags: (initial.tags || []).join(', '),
    category: initial.category ?? '',
    password: '',
  });
  const [preview, setPreview] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (isDraft) => {
    const payload = {
      ...form,
      content,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      burnAfterViews: form.burnAfterViews || null,
    };
    if (!payload.password) delete payload.password;
    onSubmit(payload, isDraft);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 flex-1">
      <Card className="flex-1 flex flex-col p-0 overflow-hidden border-outline-variant">
        <div className="bg-surface border-b border-outline-variant p-3 flex items-center gap-4 flex-wrap">
          <Input name="title" placeholder="Snippet Title..." value={form.title} onChange={change}
            className="mb-0 border-none bg-transparent text-lg focus:shadow-none w-auto flex-1 min-w-[150px]" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPreview(!preview)}
              className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface px-2 py-1 rounded border border-outline-variant">
              <Eye size={14} /> {preview ? 'Edit' : 'Preview'}
            </button>
            <select name="language" value={form.language} onChange={change} className="bg-surface-container-high text-sm text-on-surface rounded p-1 border border-outline-variant outline-none">
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-1 min-h-[500px]">
          {preview ? (
            <pre className="p-4 text-on-surface text-sm whitespace-pre-wrap overflow-auto h-full font-geist">{content}</pre>
          ) : (
            <Editor height="100%" theme="vs-dark" language={form.language} value={content}
              onChange={(v) => setContent(v ?? '')}
              options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: 'Inter, monospace', padding: { top: 16 } }} />
          )}
        </div>
      </Card>

      <aside className="w-full lg:w-80 flex flex-col gap-6">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary border-b border-outline-variant pb-3 mb-1">
            <Settings2 size={18} /> <h3 className="font-inter font-semibold">Settings</h3>
          </div>

          <Field label="Description">
            <textarea name="description" value={form.description} onChange={change} rows={2}
              className={selectCls + ' resize-none'} placeholder="Optional short description" />
          </Field>

          <Field label="Visibility">
            <select name="visibility" value={form.visibility} onChange={change} className={selectCls}>
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PRIVATE">Private</option>
            </select>
          </Field>

          <Field label="Expiration (Redis TTL)">
            <select name="expiration" value={form.expiration} onChange={change} className={selectCls}>
              <option value="NEVER">Never</option>
              <option value="10_MINUTES">10 Minutes</option>
              <option value="1_HOUR">1 Hour</option>
              <option value="1_DAY">1 Day</option>
              <option value="7_DAYS">7 Days</option>
              <option value="30_DAYS">30 Days</option>
            </select>
          </Field>

          <Field label="Burn After Reading">
            <select name="burnAfterViews" value={form.burnAfterViews} onChange={change} className={selectCls}>
              <option value="">Disabled</option>
              <option value="1">After 1 View</option>
              <option value="5">After 5 Views</option>
              <option value="10">After 10 Views</option>
            </select>
          </Field>

          <Field label="Tags (comma separated)">
            <Input name="tags" value={form.tags} onChange={change} className="mb-0" placeholder="react, hooks, api" />
          </Field>

          <Field label="Category">
            <Input name="category" value={form.category} onChange={change} className="mb-0" placeholder="e.g. snippets" />
          </Field>

          <Field label="Password Protection">
            <Input name="password" type="password" value={form.password} onChange={change} className="mb-0"
              placeholder={mode === 'edit' ? 'Leave blank to keep' : 'Optional'} />
          </Field>
        </Card>

        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={() => submit(false)} disabled={submitting} className="w-full py-3 flex items-center justify-center gap-2">
            <Save size={18} /> {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Publish Snippet'}
          </Button>
          <Button variant="secondary" onClick={() => submit(true)} disabled={submitting} className="w-full flex items-center justify-center gap-2">
            <FileEdit size={16} /> Save as Draft
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default PasteEditor;
