// Pexels image search — pulls real, relevant photos for generated B2C posts.
// Falls back gracefully (returns []) when the key is missing or the API errors,
// so callers can use their existing placeholder pool.

const PEXELS_SEARCH = "https://api.pexels.com/v1/search";

interface PexelsPhoto {
  src?: { large?: string; medium?: string; original?: string };
}

export async function searchPexelsImages(query: string, count = 12): Promise<string[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key || !query.trim()) return [];

  try {
    const url = `${PEXELS_SEARCH}?query=${encodeURIComponent(query.trim())}&per_page=${Math.min(Math.max(count, 1), 80)}&orientation=square`;
    const res = await fetch(url, {
      headers: { Authorization: key },
      // Pexels results are stable enough to cache for a while.
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { photos?: PexelsPhoto[] };
    return (data.photos ?? [])
      .map((p) => p.src?.large ?? p.src?.medium ?? p.src?.original)
      .filter((u): u is string => Boolean(u));
  } catch {
    return [];
  }
}
