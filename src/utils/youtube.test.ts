import { describe, expect, it } from 'vitest';
import { extractYouTubeVideoId } from './youtube';

describe('extractYouTubeVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=10', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('normalizes %s', (input, expected) => {
    expect(extractYouTubeVideoId(input)).toBe(expected);
  });

  it('returns an empty string for an unsupported URL', () => {
    expect(extractYouTubeVideoId('https://example.com/video')).toBe('');
  });
});
