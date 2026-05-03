import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationDropdown } from '@/components/ui/display/NotificationDropdown';

describe('NotificationDropdown', () => {
  it('renders correctly when open', () => {
    render(<NotificationDropdown isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Notifications/i)).toBeDefined();
  });
});
