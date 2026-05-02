import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VerifyPage from '../verify/page';
import React from 'react';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
const mockGet = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('VerifyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('shows success message when verification is successful', async () => {
    mockGet.mockReturnValue('valid-token');
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    render(<VerifyPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/verify?token=valid-token');
      expect(screen.getByText('success')).toBeInTheDocument();
    });
  });

  it('shows error message when verification fails', async () => {
    mockGet.mockReturnValue('invalid-token');
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(<VerifyPage />);

    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  it('shows error message when no token is provided', async () => {
    mockGet.mockReturnValue(null);

    render(<VerifyPage />);

    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });
});
