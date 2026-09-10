export const extractYouTubeVideoId = (value?: string): string => {
  if (!value) return '';

  const candidate = value.trim();
  if (!candidate) return '';
  if (!candidate.includes('youtube.com') && !candidate.includes('youtu.be') && !candidate.includes('://')) {
    return candidate;
  }

  try {
    const url = new URL(candidate);
    if (url.hostname === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || '';
    }
    if (url.hostname.endsWith('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v') || '';
      const segments = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(segments[0])) return segments[1] || '';
    }
  } catch {
    return '';
  }

  return '';
};
