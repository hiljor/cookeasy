import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditProfilePage from '../page';
import React from 'react';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
const mockBack = vi.fn();
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

// Mock useAuth
const mockRefreshUser = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'oldchef', bio: 'Old bio' },
    refreshUser: mockRefreshUser,
  }),
}));

// Mock components
vi.mock('@/components/ui/form/ImageUpload', () => ({
  ImageUpload: () => <div data-testid="image-upload" />,
}));
vi.mock('@/components/ui/form/ThemeSelector', () => ({
  ThemeSelector: () => <div data-testid="theme-selector" />,
}));

describe('EditProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders with current user data', () => {
    render(<EditProfilePage />);
    expect(screen.getByLabelText('username')).toHaveValue('oldchef');
    expect(screen.getByLabelText('bio')).toHaveValue('Old bio');
  });

  it('submits profile updates successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    render(<EditProfilePage />);

    fireEvent.change(screen.getByLabelText('username'), { target: { value: 'newchef' } });
    fireEvent.change(screen.getByLabelText('bio'), { target: { value: 'New bio' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', expect.any(Object));
      expect(mockRefreshUser).toHaveBeenCalled();
    });
  });

  it('handles cancel button', () => {
    render(<EditProfilePage />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockBack).toHaveBeenCalled();
  });
});
