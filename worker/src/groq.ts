import type { SentimentResult, SentimentPost } from './types';
import type { RSSPost } from './rss';

/**
 * Phase 2b — Send filtered Reddit posts to Groq Llama 3.3 70B
 * for batch sentiment classification. Groq's LPU processes 100 posts
 * in ~2-3 seconds at 750 tokens/second.
 */
export async function analyzeSentiment(
    ticker: string,
    posts: RSSPost[],
    apiKey: string
): Promise<SentimentResult> {
    if (posts.length === 0) {
        return {
            bullishPercent: 0,
            bearishPercent: 0,
            neutralPercent: 0,
            totalPosts: 0,
            posts: [],
            themes: [],
        };
    }

    const postTexts = posts
        .slice(0, 100)
        .map((p, i) => `${i + 1}. ${p.title}`)
        .join('\n');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are a financial sentiment analyzer. Classify each post as Bullish, Bearish, or Neutral for the stock ticker ${ticker}. Extract the key argument in 5 words or less as the "theme". Return ONLY a JSON object with this exact structure:
{
  "posts": [{"title": "...", "sentiment": "Bullish|Bearish|Neutral", "theme": "..."}],
  "themes": ["top theme 1", "top theme 2", "top theme 3", "top theme 4"]
}`,
                },
                {
                    role: 'user',
                    content: `Classify these posts for ${ticker}:\n\n${postTexts}`,
                },
            ],
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: 'json_object' },
        }),
    });

    if (!res.ok) {
        throw new Error(`Groq API failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
        choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content ?? '{}';
    let parsed: { posts?: SentimentPost[]; themes?: string[] };
    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error('Failed to parse Groq sentiment response as JSON');
    }

    const classifiedPosts: SentimentPost[] = parsed.posts ?? [];

    // Calculate percentages
    const total = classifiedPosts.length || 1;
    const bullish = classifiedPosts.filter((p) => p.sentiment === 'Bullish').length;
    const bearish = classifiedPosts.filter((p) => p.sentiment === 'Bearish').length;
    const neutral = total - bullish - bearish;

    return {
        bullishPercent: Math.round((bullish / total) * 100),
        bearishPercent: Math.round((bearish / total) * 100),
        neutralPercent: Math.round((neutral / total) * 100),
        totalPosts: total,
        posts: classifiedPosts.slice(0, 20),
        themes: parsed.themes ?? [],
    };
}
