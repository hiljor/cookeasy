import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../login/page';
import RegisterPage from '../register/page';
import React from 'react';
import { toast } from 'sonner';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Auth Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('LoginPage', () => {
    it('submits login form successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: '1' } }),
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText('email'), { target: { value: 'test@ex.com' } });
      fireEvent.change(screen.getByLabelText('password'), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error toast on login failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText('email'), { target: { value: 'wrong@ex.com' } });
      fireEvent.change(screen.getByLabelText('password'), { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
      });
    });
  });

  describe('RegisterPage', () => {
    it('submits registration form successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      render(<RegisterPage />);

      fireEvent.change(screen.getByLabelText('username'), { target: { value: 'newchef' } });
      fireEvent.change(screen.getByLabelText('email'), { target: { value: 'new@ex.com' } });
      fireEvent.change(screen.getByLabelText('password'), { target: { value: 'password123!' } });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText('success')).toBeInTheDocument();
      });
    });
  });
});
