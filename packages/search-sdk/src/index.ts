import { z } from "zod";

export const SearchDomainSchema = z.enum(["chat", "tube", "market", "community", "book", "blogs"]);
export type SearchDomain = z.infer<typeof SearchDomainSchema>;

export const SearchResultSchema = z.object({
  id: z.string().min(1),
  domain: SearchDomainSchema,
  title: z.string().min(1),
  snippet: z.string().max(160).optional(),
  href: z.string().min(1),
  isShowcase: z.boolean().optional(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export const SearchResponseSchema = z.object({
  query: z.string().min(1),
  results: z.array(SearchResultSchema),
  tookMs: z.number().min(0),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const showcaseResults: SearchResult[] = [
  { id: "chat-1", domain: "chat", title: "KebuStore Support", snippet: "Your order #4821 is out for delivery", href: "/chat/1", isShowcase: true },
  { id: "tube-1", domain: "tube", title: "Sovereign Roots — Timket", snippet: "Feed → player → transcoding", href: "/tube/v-showcase-1", isShowcase: true },
  { id: "market-1", domain: "market", title: "KebuCraft Basket", snippet: "RWF 250.00 · handwoven", href: "/market/prod-showcase-1", isShowcase: true },
  { id: "community-1", domain: "community", title: "Heritage Circles", snippet: "Welcome to KebuCommunity", href: "/community/g-showcase-1", isShowcase: true },
];

export function buildSearchUrl(query: string, domain?: SearchDomain): string {
  const base = (typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { searchBase?: string } }).__KEBUGRAM_CONFIG__?.searchBase : "") ?? "/api/search";
  const params = new URLSearchParams({ q: query });
  if (domain) params.set("domain", domain);
  return `${base}?${params.toString()}`;
}

export async function search(query: string, domain?: SearchDomain): Promise<SearchResponse> {
  const q = query.trim();
  if (!q) return { query: q, results: [], tookMs: 0 };
  const url = buildSearchUrl(q, domain);
  const t0 = Date.now();
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as unknown;
    return SearchResponseSchema.parse(json);
  } catch {
    const tookMs = Date.now() - t0;
    const filtered = showcaseResults.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()) || (r.snippet ?? "").toLowerCase().includes(q.toLowerCase()));
    const results = filtered.length ? filtered : showcaseResults.slice(0, 2);
    return { query: q, results: domain ? results.filter((r) => r.domain === domain) : results, tookMs };
  }
}
