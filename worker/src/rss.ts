export interface RSSPost {
    title: string;
    description: string;
    link: string;
    pubDate: string;
}

const SUBREDDITS = ['wallstreetbets', 'stocks', 'investing'];

/**
 * Fetch Reddit RSS feeds for multiple subreddits, filter by ticker mention.
 * Returns up to 50 relevant posts. Uses regex-based XML parsing
 * since Workers runtime has no DOMParser.
 */
export async function fetchRedditPosts(ticker: string): Promise<RSSPost[]> {
    const allPosts: RSSPost[] = [];
    const tickerUpper = ticker.toUpperCase();
    const tickerPattern = new RegExp(`\\b${escapeRegex(tickerUpper)}\\b`, 'i');

    const feeds = SUBREDDITS.map((sub) =>
        fetch(`https://www.reddit.com/r/${sub}/search.rss?q=${encodeURIComponent(ticker)}&sort=new&limit=50`, {
            headers: { 'User-Agent': 'NipunAI/1.0' },
        })
            .then((r) => (r.ok ? r.text() : ''))
            .catch(() => '')
    );

    const results = await Promise.all(feeds);

    for (const xml of results) {
        if (!xml) continue;
        const items = parseRSSItems(xml);
        for (const item of items) {
            if (tickerPattern.test(item.title) || tickerPattern.test(item.description)) {
                allPosts.push(item);
            }
        }
    }

    // Deduplicate by title and limit to 50
    const seen = new Set<string>();
    const unique: RSSPost[] = [];
    for (const post of allPosts) {
        const key = post.title.toLowerCase().trim();
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(post);
        }
        if (unique.length >= 50) break;
    }

    return unique;
}

// ─── Simple RSS XML Parser ─────────────────────────────────────────
function parseRSSItems(xml: string): RSSPost[] {
    const items: RSSPost[] = [];

    // Handle both <item> (RSS 2.0) and <entry> (Atom) formats
    const entryRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
    let match: RegExpExecArray | null;

    while ((match = entryRegex.exec(xml)) !== null) {
        const block = match[1];
        items.push({
            title: extractTag(block, 'title'),
            description: extractTag(block, 'description') || extractTag(block, 'content'),
            link: extractTag(block, 'link') || extractAttr(block, 'link', 'href'),
            pubDate: extractTag(block, 'pubDate') || extractTag(block, 'updated'),
        });
    }

    return items;
}

function extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
    const m = xml.match(regex);
    return m ? m[1].trim() : '';
}

function extractAttr(xml: string, tag: string, attr: string): string {
    const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
    const m = xml.match(regex);
    return m ? m[1] : '';
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
