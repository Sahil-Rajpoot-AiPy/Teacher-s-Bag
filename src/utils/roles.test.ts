import { describe, expect, it } from 'vitest';
import { resolveUserRole } from './roles';

describe('resolveUserRole', () => {
  it('uses a stored admin role', () => {
    expect(resolveUserRole({ id: '1', uid: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' })).toBe('admin');
  });

  it('defaults missing profiles to teacher', () => {
    expect(resolveUserRole(null)).toBe('teacher');
  });
});
