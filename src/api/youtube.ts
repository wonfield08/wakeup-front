export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  isShorts: boolean;
  embedUrl: string;
}

export function parseYouTubeUrl(input: string): string | null {
  const clean = input.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
  // shorts
  const shortsMatch = clean.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  // watch?v=
  const watchMatch = clean.match(/youtube\.com\/watch\?.*v=([A-Za-z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // youtu.be/
  const shortMatch = clean.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  // bare ID
  if (/^[A-Za-z0-9_-]{11}$/.test(clean)) return clean;
  return null;
}

export function isYouTubeShortsUrl(input: string): boolean {
  return /youtube\.com\/shorts\//.test(input);
}

export function getEmbedUrl(videoId: string, autoplay = true, mute = false): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    loop: '1',
    playlist: videoId,
    controls: '0',
    modestbranding: '1',
    rel: '0',
  });
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}

export async function fetchVideoInfo(videoId: string): Promise<YouTubeVideoInfo | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      videoId,
      title: data.title as string,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      isShorts: false,
      embedUrl: getEmbedUrl(videoId),
    };
  } catch {
    return null;
  }
}
