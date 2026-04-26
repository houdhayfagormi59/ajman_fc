import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type, systemPrompt, context, playerId } = await req.json();

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!geminiKey && !anthropicKey) {
    return NextResponse.json({
      result: `⚠️ No AI API key configured.\n\n` +
        `OPTION 1 — Google Gemini (FREE, recommended):\n` +
        `• Go to: https://aistudio.google.com/app/apikey\n` +
        `• Click "Create API Key"\n` +
        `• Add to your .env.local: GEMINI_API_KEY=AIzaSy...\n` +
        `• On Vercel: Settings → Environment Variables → GEMINI_API_KEY\n\n` +
        `OPTION 2 — Anthropic Claude (paid):\n` +
        `• Go to: https://console.anthropic.com\n` +
        `• Add: ANTHROPIC_API_KEY=sk-ant-...\n\n` +
        `Both work. Gemini is 100% free (1500 requests/day).`
    });
  }

  try {
    let result = '';

    if (geminiKey) {
      const fullPrompt = `${systemPrompt}\n\n---\n\n${context}`;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        }
      );
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini error: ${err}`);
      }
      const data = await response.json();
      result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';

    } else if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: 'user', content: context }],
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      result = data.content?.[0]?.text || 'No response.';
    }

    // Save to DB (non-blocking)
    supabase.from('ai_analyses').insert({
      coach_id: user.id, player_id: playerId || null,
      analysis_type: type, prompt: context?.slice(0, 1000), result: result?.slice(0, 5000),
    }).then(() => {});

    return NextResponse.json({ result, provider: geminiKey ? 'gemini' : 'claude' });

  } catch (err: any) {
    return NextResponse.json({ result: `❌ AI Error: ${err.message || 'Unknown error'}. Check your API key.` });
  }
}
