/**
 * Zenthra Systems - Live Web Scraper & Real Business Discovery
 * Real search engine query, domain extraction, and on-page email harvesting.
 */

async function searchLiveWeb(query, maxResults = 10) {
  try {
    const searchUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const html = await res.text();
    const results = [];
    const blockRegex = /<div class="result\s+results_links[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    let match;

    const skipDomains = [
      'duckduckgo.com', 'google.com', 'bing.com', 'yahoo.com', 'facebook.com',
      'instagram.com', 'linkedin.com', 'twitter.com', 'x.com', 'youtube.com',
      'wikipedia.org', 'yelp.com', 'tripadvisor.com', 'yellowpages.com',
      'mapquest.com', 'bbb.org', 'glassdoor.com', 'indeed.com', 'zoominfo.com',
      'crunchbase.com', 'dnb.com', 'bloomberg.com', 'pinterest.com'
    ];

    while ((match = blockRegex.exec(html)) !== null && results.length < maxResults * 2) {
      const block = match[1];

      // Extract real destination URL
      const uddgMatch = /href="[^"]*uddg=([^"&]+)/i.exec(block);
      let realUrl = null;
      if (uddgMatch) {
        realUrl = decodeURIComponent(uddgMatch[1]);
      } else {
        const rawHref = /href="(https?:\/\/[^"]+)"/i.exec(block);
        if (rawHref) realUrl = rawHref[1];
      }

      if (!realUrl) continue;

      let hostname = '';
      try {
        hostname = new URL(realUrl).hostname.toLowerCase().replace(/^www\./, '');
      } catch (_) {
        continue;
      }

      if (skipDomains.some(d => hostname === d || hostname.endsWith('.' + d))) {
        continue;
      }

      // Extract title
      const rawTitleMatch = /<a class="result__title[^>]*>([\s\S]*?)<\/a>/i.exec(block) ||
                            /<h2 class="result__title[^>]*>([\s\S]*?)<\/h2>/i.exec(block);
      let rawTitle = rawTitleMatch ? rawTitleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      
      // Clean up common suffixes in titles
      const cleanTitle = rawTitle
        .replace(/\s*[-|–]\s*(Home|Official Site|Contact Us|About Us|Services).*$/i, '')
        .replace(/\s*[-|–]\s*(Yelp|Facebook|LinkedIn|TripAdvisor).*$/i, '')
        .trim();

      // Extract snippet
      const snippetMatch = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/i.exec(block);
      const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      results.push({
        title: cleanTitle || hostname,
        url: realUrl,
        domain: hostname,
        snippet
      });
    }

    return results;
  } catch (err) {
    return [];
  }
}

async function scrapeEmailsFromWebsite(websiteUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeout);

    const text = await res.text();
    const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    
    // Filter out asset filenames and junk
    const clean = matches.filter(e => {
      const l = e.toLowerCase();
      return !l.endsWith('.png') && !l.endsWith('.jpg') && !l.endsWith('.jpeg') &&
             !l.endsWith('.webp') && !l.endsWith('.svg') && !l.endsWith('.gif') &&
             !l.endsWith('.css') && !l.endsWith('.js') && !l.includes('sentry') &&
             !l.includes('example') && !l.includes('schema') && !l.includes('webpack') &&
             !l.includes('wixpress') && !l.includes('cloudflare') && !l.includes('placeholder') &&
             !l.includes('email.com') && !l.includes('domain.com') && !l.includes('test.com') &&
             !l.includes('you@') && !l.includes('username@');
    });

    return Array.from(new Set(clean));
  } catch (_) {
    return [];
  }
}

module.exports = {
  searchLiveWeb,
  scrapeEmailsFromWebsite
};
