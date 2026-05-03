import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from "../layout/Navbar";
import { usePathname } from '@/i18n/routing';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'appName': 'Cookeasy',
      'nav.recipes': 'Recipes',
      'nav.friends': 'Friends',
      'nav.profile': 'Profile',
    };
    return translations[key] || key;
  },
  useLocale: () => 'en',
}));

// Mock custom routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
  usePathname: vi.fn(() => '/'),
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Navbar Component', () => {
  it('renders the application logo/name', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<Navbar />);
    expect(screen.getByText('Cookeasy')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<Navbar />);
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    expect(screen.getByText('Friends')).toBeInTheDocument();
  });

  it('shows profile/login link when user is not logged in', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<Navbar />);
    // The desktop "Profile" link
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('shows username when user is logged in', () => {
    mockUseAuth.mockReturnValue({ 
      user: { username: 'testchef', email: 'test@chef.com' } 
    });
    render(<Navbar />);
    expect(screen.getByText('testchef')).toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('toggles mobile menu when menu button is clicked', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<Navbar />);
    
    const menuToggle = screen.getByLabelText('Toggle menu');
    
    fireEvent.click(menuToggle);
    // Now mobile menu links should be visible
    const mobileRecipesLink = screen.getAllByText('Recipes')[1]; // Second one is mobile
    expect(mobileRecipesLink).toBeInTheDocument();
  });

  it('highlights the active link based on pathname', () => {
    vi.mocked(usePathname).mockReturnValue('/recipes');
    
    mockUseAuth.mockReturnValue({ user: null });
    render(<Navbar />);
    
    const recipesLink = screen.getByText('Recipes');
    expect(recipesLink).toHaveClass('text-primary-foreground');
    expect(recipesLink).toHaveClass('underline');
  });
});
