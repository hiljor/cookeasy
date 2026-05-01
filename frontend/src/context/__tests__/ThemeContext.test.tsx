import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '../AuthContext';

// Mock useAuth
vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(),
}));

const TestComponent = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={() => setTheme('midnight')}>Set Midnight</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'default');
    localStorage.clear();
    vi.clearAllMocks();
    
    // Default mock implementation
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: false,
    });
  });

  it('provides default theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value').textContent).toBe('default');
    expect(document.documentElement.getAttribute('data-theme')).toBe('default');
  });

  it('updates theme and document attribute', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText('Set Midnight').click();
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('midnight');
    expect(document.documentElement.getAttribute('data-theme')).toBe('midnight');
    expect(localStorage.getItem('theme')).toBe('midnight');
  });

  it('syncs theme from user settings when logged in', () => {
    (useAuth as any).mockReturnValue({
      user: {
        settings: { theme: 'earthy' }
      },
      isLoading: false,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('earthy');
    expect(document.documentElement.getAttribute('data-theme')).toBe('earthy');
  });
});
