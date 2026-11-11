/**
 * Zenthra Systems - Real-Time Map Scraper & Website Contact Extractor
 *
 * Capabilities:
 * - Real-time live map discovery via OpenStreetMap Nominatim + Photon (zero API key required)
 * - Optional official Google Places Text Search & Details enrichment (when GOOGLE_PLACES_API_KEY provided)
 * - Direct live website contact scraping (/, /contact, /contact-us, /kontakt, /impressum, /about)
 * - Real extraction of email addresses (including mailto: & Cloudflare cfemail decoding),
 *   phone numbers (tel: + international formats), executive/operator/doctor names, JSON-LD addresses,
 *   and digital weakness signals (SSL, booking flow, live chat widget).
 */

const GENERIC_POI_NAMES = new Set([
  'garments', 'dentist', 'solar', 'software', 'hospital', 'restaurant', 'hotel',
  'logistics', 'pharmacy', 'clinic', 'school', 'manufacturing', 'company',
  'office', 'warehouse', 'factory', 'shop', 'store', 'yes', 'building'
]);

const SKIP_EMAIL_PATTERNS = /\.(png|jpg|jpeg|webp|gif|svg|css|js|woff|woff2|ttf|ico)$/i;
const SKIP_EMAIL_DOMAINS = /(sentry|wixpress|example\.com|test\.com|domain\.com|email\.com|yourdomain|placeholder|u003e|schema\.org|w3\.org)/i;

const CATEGORY_OSM_PROFILES = {
  rmg_apparel: { osmTags: ['[shop=clothes]', '[craft=tailor]'], keywords: ['textile', 'garment', 'apparel', 'fashion'] },
  logistics: { osmTags: ['[office=logistics]', '[office=transport]', '[amenity=post_depot]'], keywords: ['spedition', 'logistics', 'freight', 'cargo'] },
  dental: { osmTags: ['[amenity=dentist]', '[healthcare=dentist]'], keywords: ['dentist', 'zahnarzt', 'dental'] },
  medical: { osmTags: ['[amenity=clinic]', '[amenity=doctors]', '[amenity=hospital]'], keywords: ['clinic', 'medical', 'hospital', 'praxis'] },
  hvac_plumbing: { osmTags: ['[craft=hvac]', '[craft=plumber]', '[craft=electrician]'], keywords: ['hvac', 'plumbing', 'heating', 'heizung'] },
  construction: { osmTags: ['[office=architect]', '[office=construction_company]', '[craft=builder]'], keywords: ['construction', 'architect', 'bau'] },
  accounting: { osmTags: ['[office=accountant]', '[office=tax_advisor]'], keywords: ['accountant', 'accounting', 'tax', 'steuerberater'] },
  legal: { osmTags: ['[office=lawyer]', '[office=notary]'], keywords: ['law firm', 'solicitor', 'attorney', 'rechtsanwalt'] },
  manufacturing: { osmTags: ['[craft=metal_construction]', '[man_made=works]', '[industrial=factory]'], keywords: ['maschinenbau', 'engineering', 'metallbau', 'manufacturing'] },
  software_tech: { osmTags: ['[office=it]', '[office=telecommunication]'], keywords: ['software', 'technology', 'solutions'] },
  ecommerce_retail: { osmTags: ['[shop=wholesale]', '[shop=department_store]'], keywords: ['wholesale', 'distribution', 'handel'] },
  hospitality: { osmTags: ['[tourism=hotel]', '[tourism=resort]'], keywords: ['hotel', 'resort'] },
  restaurants: { osmTags: ['[amenity=restaurant]'], keywords: ['restaurant', 'catering'] },
  auto_fleet: { osmTags: ['[shop=car]', '[shop=car_repair]'], keywords: ['motors', 'dealership', 'autohaus'] },
  real_estate: { osmTags: ['[office=estate_agent]', '[office=property_management]'], keywords: ['real estate', 'immobilien', 'property'] },
  pharma_biotech: { osmTags: ['[healthcare=laboratory]', '[amenity=pharmacy]', '[office=research]'], keywords: ['pharma', 'laboratory', 'biotech'] },
  energy_solar: { osmTags: ['[craft=solar_installation]', '[office=energy_supplier]'], keywords: ['solar', 'renewable', 'energie'] },
  education: { osmTags: ['[amenity=college]', '[amenity=school]'], keywords: ['academy', 'institute', 'college'] }
};

function decodeCloudflareEmail(hex) {
  if (!hex || hex.length < 4) return null;
  const key = parseInt(hex.substr(0, 2), 16);
  let out = '';
  for (let i = 2; i < hex.length; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16) ^ key;
    out += String.fromCharCode(code);
  }
  return out.includes('@') ? out.toLowerCase() : null;
}

function extractCleanEmailsFromText(htmlOrText) {
  if (!htmlOrText) return [];
  const found = new Set();

  // 1. Decode Cloudflare protected emails
  const cfMatches = htmlOrText.matchAll(/data-cfemail="([a-f0-9]+)"/gi);
  for (const m of cfMatches) {
    const decoded = decodeCloudflareEmail(m[1]);
    if (decoded) found.add(decoded);
  }

  // 2. Direct mailto: links
  const mailtoMatches = htmlOrText.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi);
  for (const m of mailtoMatches) {
    found.add(m[1].toLowerCase());
  }

  // 3. Plaintext email patterns (strip tags first to avoid JS/attribute noise)
  const plain = htmlOrText.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const stdMatches = plain.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  for (const e of stdMatches) {
    found.add(e.toLowerCase());
  }

  return Array.from(found).filter(e => {
    return e.length <= 80 && !SKIP_EMAIL_PATTERNS.test(e) && !SKIP_EMAIL_DOMAINS.test(e);
  });
}

function extractCleanPhonesFromText(htmlOrText) {
  if (!htmlOrText) return [];
  const found = new Set();
  const telMatches = htmlOrText.matchAll(/href="tel:([+\d()\s.\-/]{7,24})"/gi);
  for (const m of telMatches) {
    found.add(m[1].trim());
  }
  const plain = htmlOrText.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const intlMatches = plain.match(/(?:\+\d{1,3}[\s.-]?|\(\d{2,5}\)[\s.-]?)\d[\d\s.\-()]{5,15}\d/g) || [];
  for (const p of intlMatches) {
    const clean = p.trim();
    const digits = clean.replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 16) found.add(clean);
  }
  return Array.from(found).slice(0, 4);
}

function extractPeopleAndJsonLd(html) {
  const people = new Set();
  const addresses = [];
  if (!html) return { people: [], addresses: [] };

  // JSON-LD schema inspection
  const ldMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of ldMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed]);
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        if (item['@type'] === 'Person' && item.name) people.add(String(item.name).trim());
        if (item.founder) {
          const founders = Array.isArray(item.founder) ? item.founder : [item.founder];
          founders.forEach(f => f?.name && people.add(String(f.name).trim()));
        }
        if (item.employee) {
          const emps = Array.isArray(item.employee) ? item.employee : [item.employee];
          emps.forEach(emp => emp?.name && people.add(String(emp.name).trim()));
        }
        if (item.address && typeof item.address === 'object') {
          const a = item.address;
          const line = [a.streetAddress, a.postalCode, a.addressLocality, a.addressCountry].filter(Boolean).join(', ');
          if (line.length > 6) addresses.push(line);
        }
      }
    } catch (_) {}
  }

  // Visible text executive/doctor/owner role extraction
  const plain = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const rolePatterns = [
    /(?:Dr\.|Prof\.|Geschäftsführer(?:in)?|Managing Director|CEO|Chief Executive|Founder|Owner|Director|Partner|Inhaber(?:in)?|Vertretungsberechtigt|Praxisinhaber)[:\s]+([A-ZÄÖÜ][a-zäöüß-]{1,20}\s+[A-ZÄÖÜ][a-zäöüß-]{1,25}(?:\s+[A-ZÄÖÜ][a-zäöüß-]{1,20})?)/g,
    /\b(Dr\.\s+(?:med\.\s+dent\.\s+)?[A-ZÄÖÜ][a-zäöüß-]+\s+[A-ZÄÖÜ][a-zäöüß-]+)\b/g
  ];
  for (const rx of rolePatterns) {
    let m;
    while ((m = rx.exec(plain)) !== null) {
      const n = m[1].trim();
      if (n.length >= 5 && n.length <= 45 && !/(GmbH|Ltd|Inc|Privacy|Cookie|Menu|Home|Straße|Street|Contact|Rights)/i.test(n)) {
        people.add(n);
      }
    }
  }

  return { people: Array.from(people).slice(0, 4), addresses };
}

function discoverSubpageUrls(html, baseUrl) {
  if (!html || !baseUrl) return [];
  let origin;
  let host;
  try {
    const parsed = new URL(baseUrl);
    origin = parsed.origin;
    host = parsed.hostname.replace(/^www\./, '');
  } catch {
    return [];
  }

  const hits = [];
  const hrefRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = hrefRegex.exec(html)) !== null) {
    let href = m[1].trim();
    const label = m[2].replace(/<[^>]+>/g, '').trim().toLowerCase();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('/')) href = origin + href;
    else if (!href.startsWith('http')) continue;

    try {
      const u = new URL(href);
      if (u.hostname.replace(/^www\./, '') !== host) continue;
      const combined = label + ' ' + u.pathname.toLowerCase();
      if (/(impressum|imprint|contact|kontakt|about|team|legal)/.test(combined)) {
        const priority = /(impressum|imprint)/.test(combined) ? 1 : (/(contact|kontakt)/.test(combined) ? 2 : 3);
        hits.push({ url: u.toString(), priority });
      }
    } catch {}
  }

  hits.sort((a, b) => a.priority - b.priority);
  const seen = new Set([baseUrl]);
  const out = [];
  for (const h of hits) {
    if (!seen.has(h.url)) {
      seen.add(h.url);
      out.push(h.url);
      if (out.length >= 2) break;
    }
  }
  return out;
}

async function fetchHtmlQuick(url, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,de;q=0.8'
      }
    });
    if (!res.ok) return '';
    const ct = res.headers.get('content-type') || '';
    if (ct && !ct.includes('html') && !ct.includes('text') && !ct.includes('xml')) return '';
    return await res.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Scrapes real emails, phone numbers, executive/doctor names, JSON-LD address,
 * and real website digital signals (SSL, booking, live chat) from a business website.
 */
async function scrapeBusinessWebsiteContacts(websiteUrl) {
  if (!websiteUrl) {
    return { reachable: false, emails: [], phones: [], people: [], addresses: [], signals: {} };
  }
  let normalizedUrl = websiteUrl.trim();
  if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl;

  const homeHtml = await fetchHtmlQuick(normalizedUrl, 4500);
  if (!homeHtml) {
    return { reachable: false, emails: [], phones: [], people: [], addresses: [], signals: { hasHttps: normalizedUrl.startsWith('https://') } };
  }

  const emails = new Set(extractCleanEmailsFromText(homeHtml));
  const phones = new Set(extractCleanPhonesFromText(homeHtml));
  const ld = extractPeopleAndJsonLd(homeHtml);
  const people = new Set(ld.people);
  const addresses = new Set(ld.addresses);

  let combinedHtml = homeHtml.toLowerCase();
  const subUrls = discoverSubpageUrls(homeHtml, normalizedUrl);
  if (subUrls.length > 0) {
    const subPages = await Promise.all(subUrls.map(u => fetchHtmlQuick(u, 4000)));
    for (const subHtml of subPages) {
      if (!subHtml) continue;
      combinedHtml += ' ' + subHtml.toLowerCase();
      extractCleanEmailsFromText(subHtml).forEach(e => emails.add(e));
      extractCleanPhonesFromText(subHtml).forEach(p => phones.add(p));
      const subLd = extractPeopleAndJsonLd(subHtml);
      subLd.people.forEach(p => people.add(p));
      subLd.addresses.forEach(a => addresses.add(a));
    }
  }

  const signals = {
    hasHttps: normalizedUrl.startsWith('https://'),
    hasBookingWidget: /(calendly|acuityscheduling|doctolib|treatwell|opentable|booking|book-appointment|termin-buchen|simplybook)/.test(combinedHtml),
    hasLiveChat: /(intercom|drift|tidio|zendesk|crisp\.chat|tawk\.to|livechat|wa\.me\/|whatsapp)/.test(combinedHtml)
  };

  return {
    reachable: true,
    emails: Array.from(emails),
    phones: Array.from(phones),
    people: Array.from(people),
    addresses: Array.from(addresses),
    signals
  };
}

async function scrapeEmailsFromWebsite(websiteUrl) {
  const res = await scrapeBusinessWebsiteContacts(websiteUrl);
  return res.emails;
}

function isRealMapPoi(raw) {
  const name = (raw.name || '').trim();
  if (name.length < 3 || GENERIC_POI_NAMES.has(name.toLowerCase())) return false;
  const cls = (raw.category || raw.class || raw.osm_key || '').toLowerCase();
  if (['highway', 'boundary', 'waterway', 'natural', 'place', 'railway'].includes(cls)) return false;
  return true;
}

async function searchLiveGooglePlaces({ query, country, city, count, apiKey }) {
  if (!apiKey) return [];
  try {
    const searchStr = [query, city && city !== 'All' ? city : '', country].filter(Boolean).join(' ');
    const r = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchStr)}&key=${encodeURIComponent(apiKey)}`, {
      signal: AbortSignal.timeout(7000)
    });
    const data = await r.json();
    if (!data.results || data.results.length === 0) return [];

    const detailed = [];
    for (const item of data.results.slice(0, Math.min(count, 20))) {
      let det = {};
      try {
        const dr = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(item.place_id)}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,url,rating,user_ratings_total,address_components,geometry&key=${encodeURIComponent(apiKey)}`, {
          signal: AbortSignal.timeout(5000)
        });
        det = (await dr.json()).result || {};
      } catch {}

      detailed.push({
        source: 'Google Places API (Live)',
        place_id: 'gmap_' + item.place_id,
        name: det.name || item.name,
        address: det.formatted_address || item.formatted_address || '',
        city: city && city !== 'All' ? city : '',
        country: country || '',
        lat: det.geometry?.location?.lat || item.geometry?.location?.lat,
        lon: det.geometry?.location?.lng || item.geometry?.location?.lng,
        phone: det.international_phone_number || det.formatted_phone_number || '',
        website_url: det.website || '',
        google_maps_url: det.url || `https://www.google.com/maps/place/?q=place_id:${item.place_id}`,
        osm_url: '',
        rating: det.rating || item.rating || null,
        review_count: det.user_ratings_total || item.user_ratings_total || 0,
        emails: [],
        people: []
      });
    }
    return detailed;
  } catch {
    return [];
  }
}

/**
 * Real-time Map Discovery (OpenStreetMap Nominatim + Photon + optional Google Places API)
 */
async function scrapeLiveMapPOIs({ country = 'Germany', city = 'All', categoryKey = '', query = '', count = 10, googlePlacesApiKey = '' }) {
  const results = [];
  const seenKeys = new Set();

  if (googlePlacesApiKey) {
    const gPlaces = await searchLiveGooglePlaces({ query, country, city, count, apiKey: googlePlacesApiKey });
    for (const gp of gPlaces) {
      const k = gp.name.toLowerCase();
      if (!seenKeys.has(k)) {
        seenKeys.add(k);
        results.push(gp);
      }
    }
  }

  if (results.length >= count) return results.slice(0, count);

  const nomHeaders = {
    'User-Agent': 'ZenthraSystemsLeadDiscovery/2.0 (+https://readuanulfaridfahim.github.io)',
    'Accept': 'application/json'
  };

  // Resolve bounding box for target city + country
  const areaQuery = (city && city !== 'All') ? `${city}, ${country}` : country;
  let area = null;
  try {
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(areaQuery)}&format=jsonv2&limit=1`, {
      headers: nomHeaders,
      signal: AbortSignal.timeout(7000)
    });
    const geoArr = geoRes.ok ? await geoRes.json() : [];
    const g = geoArr[0];
    if (g && g.boundingbox) {
      const lat = parseFloat(g.lat);
      const lon = parseFloat(g.lon);
      const bb = g.boundingbox.map(Number);
      const s = Math.max(bb[0], lat - 0.25);
      const n = Math.min(bb[1], lat + 0.25);
      const w = Math.max(bb[2], lon - 0.30);
      const e = Math.min(bb[3], lon + 0.30);
      area = {
        lat,
        lon,
        viewbox: `${w.toFixed(4)},${n.toFixed(4)},${e.toFixed(4)},${s.toFixed(4)}`,
        bbox: `${w.toFixed(4)},${s.toFixed(4)},${e.toFixed(4)},${n.toFixed(4)}`
      };
    }
  } catch {}

  const profile = CATEGORY_OSM_PROFILES[categoryKey] || CATEGORY_OSM_PROFILES.logistics;
  const searchTerms = [];
  const rawQ = (query || '').trim();
  const customKw = rawQ ? rawQ.replace(new RegExp(`\\bin\\s+${city}|${city}|${country}`, 'gi'), '').trim() : '';

  if (categoryKey && CATEGORY_OSM_PROFILES[categoryKey]) {
    profile.osmTags.forEach(tag => searchTerms.push({ term: tag, isTag: true }));
    profile.keywords.slice(0, 2).forEach(kw => searchTerms.push({ term: kw, isTag: false }));
  }
  if (customKw && !profile.keywords.includes(customKw.toLowerCase())) {
    searchTerms.unshift({ term: customKw, isTag: false });
  }

  const pushNominatimItem = (item) => {
    if (!isRealMapPoi(item)) return;
    const ext = item.extratags || {};
    const addr = item.address || {};
    const key = `${item.name.trim().toLowerCase()}|${Math.round(parseFloat(item.lat || 0) * 500)}`;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);

    const web = ext.website || ext['contact:website'] || ext.url || '';
    const rawEmail = ext.email || ext['contact:email'] || '';
    const emails = rawEmail ? rawEmail.split(/[;,]/).map(s => s.trim().toLowerCase()).filter(s => s.includes('@')) : [];
    const phone = ext.phone || ext['contact:phone'] || ext['contact:mobile'] || ext['contact:whatsapp'] || '';
    const streetLine = [addr.road || addr.pedestrian || '', addr.house_number || ''].filter(Boolean).join(' ').trim();
    const formattedAddress = [
      streetLine,
      addr.suburb || addr.neighbourhood || '',
      addr.postcode || '',
      addr.city || addr.town || addr.village || (city !== 'All' ? city : ''),
      addr.country || country
    ].filter(Boolean).join(', ') || item.display_name || '';

    const operatorName = ext.operator || ext['contact:person'] || ext.owner || '';
    const osmType = item.osm_type || 'node';
    const osmUrl = item.osm_id ? `https://www.openstreetmap.org/${osmType}/${item.osm_id}` : '';
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + formattedAddress)}`;

    results.push({
      source: 'OpenStreetMap Nominatim (Live)',
      place_id: `osm_${osmType}_${item.osm_id || Date.now()}`,
      name: item.name.trim(),
      business_type: item.type || categoryKey || 'Commercial Business',
      address: formattedAddress,
      street: streetLine || addr.road || '',
      city: addr.city || addr.town || addr.village || (city !== 'All' ? city : ''),
      state: addr.state || addr.region || '',
      postal_code: addr.postcode || '',
      country: addr.country || country,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      phone,
      website_url: web,
      emails,
      email_source: emails.length > 0 ? 'Live Map POI Tag' : '',
      people: operatorName ? [operatorName] : [],
      osm_url: osmUrl,
      google_maps_url: gmapsUrl,
      completenessScore: (emails.length ? 5 : 0) + (web ? 4 : 0) + (phone ? 3 : 0) + (streetLine ? 2 : 0) + (operatorName ? 2 : 0)
    });
  };

  for (const entry of searchTerms) {
    if (results.length >= Math.max(count * 2, 20)) break;
    await new Promise(r => setTimeout(r, 250));
    try {
      const vb = area ? `&viewbox=${area.viewbox}&bounded=1` : '';
      const qVal = area ? entry.term : `${entry.term} ${areaQuery}`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(qVal)}${vb}&format=jsonv2&extratags=1&addressdetails=1&limit=35`;
      const r = await fetch(url, { headers: nomHeaders, signal: AbortSignal.timeout(7000) });
      if (r.ok) {
        const arr = await r.json();
        if (Array.isArray(arr)) arr.forEach(pushNominatimItem);
      }
    } catch {}
  }

  if (results.length < count && area) {
    try {
      const kw = customKw || profile.keywords[0] || 'company';
      const phUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(kw)}&bbox=${area.bbox}&limit=25`;
      const r = await fetch(phUrl, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(5000) });
      if (r.ok) {
        const ph = await r.json();
        for (const f of (ph.features || [])) {
          const p = f.properties || {};
          if (!isRealMapPoi({ name: p.name, category: p.osm_key })) continue;
          const coords = f.geometry?.coordinates || [area.lon, area.lat];
          const key = `${p.name.trim().toLowerCase()}|${Math.round(coords[1] * 500)}`;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);

          const streetLine = [p.street || '', p.housenumber || ''].filter(Boolean).join(' ').trim();
          const formattedAddress = [streetLine, p.postcode || '', p.city || (city !== 'All' ? city : ''), p.country || country].filter(Boolean).join(', ');
          const osmType = p.osm_type === 'W' ? 'way' : (p.osm_type === 'R' ? 'relation' : 'node');
          results.push({
            source: 'Photon Map Index (Live)',
            place_id: `photon_${osmType}_${p.osm_id || Date.now()}`,
            name: p.name.trim(),
            business_type: p.osm_value || categoryKey || 'Commercial Business',
            address: formattedAddress,
            street: streetLine,
            city: p.city || (city !== 'All' ? city : ''),
            state: p.state || '',
            postal_code: p.postcode || '',
            country: p.country || country,
            lat: coords[1],
            lon: coords[0],
            phone: '',
            website_url: '',
            emails: [],
            email_source: '',
            people: [],
            osm_url: p.osm_id ? `https://www.openstreetmap.org/${osmType}/${p.osm_id}` : '',
            google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' ' + formattedAddress)}`,
            completenessScore: streetLine ? 2 : 1
          });
        }
      }
    } catch {}
  }

  results.sort((a, b) => (b.completenessScore || 0) - (a.completenessScore || 0));
  return results.slice(0, count);
}

async function searchLiveWeb(query, maxResults = 10) {
  try {
    const searchUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const html = await res.text();
    const results = [];
    const blockRegex = /<div class="result\s+results_links[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    let match;
    const skipDomains = ['duckduckgo.com', 'google.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'yelp.com', 'wikipedia.org'];
    while ((match = blockRegex.exec(html)) !== null && results.length < maxResults * 2) {
      const block = match[1];
      const uddgMatch = /href="[^"]*uddg=([^"&]+)/i.exec(block);
      const realUrl = uddgMatch ? decodeURIComponent(uddgMatch[1]) : (/href="(https?:\/\/[^"]+)"/i.exec(block)?.[1] || null);
      if (!realUrl) continue;
      let hostname = '';
      try { hostname = new URL(realUrl).hostname.toLowerCase().replace(/^www\./, ''); } catch { continue; }
      if (skipDomains.some(d => hostname === d || hostname.endsWith('.' + d))) continue;
      const rawTitleMatch = /<a class="result__title[^>]*>([\s\S]*?)<\/a>/i.exec(block) || /<h2 class="result__title[^>]*>([\s\S]*?)<\/h2>/i.exec(block);
      const title = rawTitleMatch ? rawTitleMatch[1].replace(/<[^>]+>/g, '').trim() : hostname;
      results.push({ title, url: realUrl, domain: hostname, snippet: '' });
    }
    return results;
  } catch {
    return [];
  }
}

module.exports = {
  searchLiveWeb,
  scrapeEmailsFromWebsite,
  scrapeBusinessWebsiteContacts,
  scrapeLiveMapPOIs,
  extractCleanEmailsFromText,
  extractCleanPhonesFromText,
  CATEGORY_OSM_PROFILES
};
