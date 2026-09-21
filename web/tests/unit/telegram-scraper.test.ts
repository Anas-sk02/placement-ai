import { describe, it, expect } from 'vitest';
import { parseMemberCount } from '../../src/lib/telegram/channel-scraper';

describe('Telegram Member Count Parser', () => {
  it('parses standard subscriber counts', () => {
    expect(parseMemberCount('12 450 subscribers')).toBe(12450);
    expect(parseMemberCount('540 subscribers')).toBe(540);
    expect(parseMemberCount('1 200 members')).toBe(1200);
  });

  it('parses abbreviated K and M counts', () => {
    expect(parseMemberCount('14.2k subscribers')).toBe(14200);
    expect(parseMemberCount('1.5M members')).toBe(1500000);
    expect(parseMemberCount('25.5K')).toBe(25500);
  });

  it('handles empty or zero gracefully', () => {
    expect(parseMemberCount('')).toBe(0);
    expect(parseMemberCount('no info')).toBe(0);
  });
});
