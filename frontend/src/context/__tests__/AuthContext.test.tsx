import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const TestComponent = () => {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user-name">{user?.username || 'none'}</span>
      <button onClick={() => login({ id: '1', username: 'testuser', email: 'test@ex.com' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('initially has no user and is loading', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    let rendered: any;
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(rendered.getByTestId('user-name').textContent).toBe('none');
  });

  it('logs in a user', async () => {
    (global.fetch as any).mockResolvedValue({
        ok: false, // for initial refreshUser and others
    });

    let rendered: any;
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      rendered.getByText('Login').click();
    });

    expect(rendered.getByTestId('user-name').textContent).toBe('testuser');
  });

  it('logs out a user', async () => {
    (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: '1', username: 'testuser' }) }) // initial load
        .mockResolvedValueOnce({ ok: true }); // logout fetch

    let rendered: any;
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(rendered.getByTestId('user-name').textContent).toBe('testuser');

    await act(async () => {
      rendered.getByText('Logout').click();
    });

    expect(rendered.getByTestId('user-name').textContent).toBe('none');
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
  });
});
