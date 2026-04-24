'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Video, Upload, Play, Tag, Clock, Film, Plus, Trash2, Brain } from 'lucide-react';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';

interface VideoRecord {
  id: string; title: string; video_url: string | null;
  duration_seconds: number | null; ai_summary: string | null;
  tags: string[]; created_at: string; annotations: any[];
  match_date: string | null; opponent: string | null;
}

const EVENT_TAGS = ['Goal', 'Assist', 'Pressing', 'Defensive Error', 'Set Piece', 'Transition', 'Tactical Pattern', 'Great Save', 'Key Pass', 'Dribble', 'Aerial Duel', 'Counter-attack'];

export default function VideoPage() {
  const supabase = createClient();
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<VideoRecord | null>(null);
  const [addTagTime, setAddTagTime] = useState<number | null>(null);
  const [newTag, setNewTag] = useState({ type: 'Goal', description: '', player: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    setLoading(true);
    const { data } = await supabase.from('video_analyses')
      .select('*').order('created_at', { ascending: false });
    setVideos((data ?? []) as VideoRecord[]);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split('.').pop();
    const path = `videos/${user.id}/${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos').upload(path, file);

    if (uploadError) {
      // If bucket doesn't exist, still save record with file name
      const { data } = await supabase.from('video_analyses').insert({
        coach_id: user.id, title: file.name.replace(/\.[^.]+$/, ''),
        video_bucket_path: path, tags: [], annotations: [],
      }).select().single();
      if (data) setVideos(v => [data as VideoRecord, ...v]);
    } else {
      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(path);
      const { data } = await supabase.from('video_analyses').insert({
        coach_id: user.id, title: file.name.replace(/\.[^.]+$/, ''),
        video_url: urlData.publicUrl, video_bucket_path: path,
        tags: [], annotations: [],
      }).select().single();
      if (data) setVideos(v => [data as VideoRecord, ...v]);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function addAnnotation() {
    if (!selected || addTagTime === null) return;
    const annotation = {
      id: Math.random().toString(36).slice(2),
      time_seconds: addTagTime,
      type: newTag.type,
      label: newTag.type,
      description: newTag.description,
      player: newTag.player,
    };
    const updated = { ...selected, annotations: [...(selected.annotations || []), annotation].sort((a, b) => a.time_seconds - b.time_seconds) };
    await supabase.from('video_analyses').update({ annotations: updated.annotations }).eq('id', selected.id);
    setSelected(updated);
    setVideos(vs => vs.map(v => v.id === updated.id ? updated : v));
    setAddTagTime(null);
    setNewTag({ type: 'Goal', description: '', player: '' });
  }

  async function generateAiSummary() {
    if (!selected) return;
    setAiLoading(true);
    const annotationStr = selected.annotations.length > 0
      ? selected.annotations.map(a => `${Math.floor(a.time_seconds / 60)}'${a.time_seconds % 60}" — ${a.type}: ${a.description || ''} (${a.player || 'Team'})`).join('\n')
      : 'No events tagged yet.';

    const prompt = `Video: ${selected.title}\n${selected.match_date ? `Date: ${selected.match_date}` : ''}\n${selected.opponent ? `vs ${selected.opponent}` : ''}\n\nTagged Events:\n${annotationStr}`;

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'match_analysis',
          systemPrompt: 'You are an elite football video analyst. Based on the tagged events from this match video, provide a concise analysis: 1) Key performance moments 2) Tactical patterns 3) Individual highlights 4) Recommended coaching focus points.',
          context: prompt,
        }),
      });
      const data = await res.json();
      const summary = data.result || 'AI analysis unavailable.';
      await supabase.from('video_analyses').update({ ai_summary: summary }).eq('id', selected.id);
      setSelected(s => s ? { ...s, ai_summary: summary } : s);
      setVideos(vs => vs.map(v => v.id === selected.id ? { ...v, ai_summary: summary } : v));
    } catch {
      console.error('AI summary failed');
    }
    setAiLoading(false);
  }

  async function deleteVideo(id: string) {
    if (!confirm('Delete this video record?')) return;
    await supabase.from('video_analyses').delete().eq('id', id);
    setVideos(vs => vs.filter(v => v.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}'${sec.toString().padStart(2, '0')}"`;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-header">Video Hub</h1>
          <p className="section-sub">Upload match footage, tag events & generate AI analysis</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="video/*" onChange={handleUpload} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload Video'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card h-48 animate-pulse" style={{ background: 'var(--bg-soft)' }} />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Video size={48} />}
            title="No videos yet"
            description="Upload match footage to start tagging events and generating AI analysis."
            action={
              <Button onClick={() => fileRef.current?.click()}>
                <Upload size={15} /> Upload your first video
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Video list */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Video Library ({videos.length})</h2>
            {videos.map(v => (
              <div key={v.id}
                className={`card p-3 cursor-pointer card-hover ${selected?.id === v.id ? 'border-brand-500 shadow-glow-orange' : ''}`}
                style={selected?.id === v.id ? { borderColor: '#EA580C' } : {}}
                onClick={() => setSelected(v)}>
                <div className="flex items-start gap-2">
                  <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                    <Film size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{v.title}</div>
                    <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      {v.match_date && <span>{v.match_date}</span>}
                      {v.annotations?.length > 0 && <span className="pill-blue">{v.annotations.length} events</span>}
                      {v.ai_summary && <span className="pill-green">AI ✓</span>}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteVideo(v.id); }} className="text-slate-400 hover:text-red-500 transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Video detail */}
          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                {/* Video player */}
                <div className="card p-4">
                  <h2 className="font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>{selected.title}</h2>
                  {selected.video_url ? (
                    <video src={selected.video_url} controls className="w-full rounded-xl aspect-video bg-black" />
                  ) : (
                    <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center gap-3">
                      <Film size={48} className="text-slate-600" />
                      <p className="text-sm text-slate-500">Video file stored in Supabase Storage</p>
                      <p className="text-xs text-slate-600">Configure storage bucket "videos" to enable playback</p>
                    </div>
                  )}
                </div>

                {/* Event Tagger */}
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Tag size={14} className="text-brand-600" /> Event Tagger
                    </h3>
                    <button onClick={() => setAddTagTime(0)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg gradient-brand text-white hover:opacity-90">
                      <Plus size={12} /> Tag Event
                    </button>
                  </div>

                  {addTagTime !== null && (
                    <div className="card p-3 mb-3 gradient-brand-soft space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="label block mb-1">Video Time (seconds)</label>
                          <input type="number" className="input-base text-sm" value={addTagTime}
                            onChange={e => setAddTagTime(parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label className="label block mb-1">Event Type</label>
                          <select className="input-base text-sm" value={newTag.type}
                            onChange={e => setNewTag(n => ({ ...n, type: e.target.value }))}>
                            {EVENT_TAGS.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input className="input-base text-sm" placeholder="Player name" value={newTag.player}
                          onChange={e => setNewTag(n => ({ ...n, player: e.target.value }))} />
                        <input className="input-base text-sm" placeholder="Description" value={newTag.description}
                          onChange={e => setNewTag(n => ({ ...n, description: e.target.value }))} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={addAnnotation} className="px-3 py-1.5 rounded-lg gradient-brand text-white text-xs font-bold">Save Tag</button>
                        <button onClick={() => setAddTagTime(null)} className="px-3 py-1.5 rounded-lg card text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Annotations list */}
                  {selected.annotations?.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                      {selected.annotations.map((a: any) => (
                        <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg gradient-brand-soft text-xs">
                          <span className="font-bold text-brand-600 w-12 flex-shrink-0">{formatTime(a.time_seconds)}</span>
                          <span className="pill-orange">{a.type}</span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{a.player}</span>
                          <span className="flex-1" style={{ color: 'var(--text-secondary)' }}>{a.description}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-2 text-center" style={{ color: 'var(--text-secondary)' }}>No events tagged yet. Click "Tag Event" to start.</p>
                  )}
                </div>

                {/* AI Summary */}
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Brain size={14} className="text-brand-600" /> AI Video Analysis
                    </h3>
                    <Button size="sm" onClick={generateAiSummary} loading={aiLoading}>
                      {aiLoading ? 'Analysing…' : '⚡ Generate'}
                    </Button>
                  </div>
                  {selected.ai_summary ? (
                    <pre className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                      {selected.ai_summary}
                    </pre>
                  ) : (
                    <p className="text-xs text-center py-3" style={{ color: 'var(--text-secondary)' }}>
                      Tag some events first, then click Generate for AI-powered match insights
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="card p-8 text-center">
                <Play size={48} className="text-brand-300 mx-auto mb-3" />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select a video to view details, tag events and generate AI analysis</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
