import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from "../form/Input";

describe('Input Component', () => {
  it('renders correctly with a label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('displays an error message and applies error styles', () => {
    render(<Input label="Email" error="Invalid email address" />);
    const errorText = screen.getByText('Invalid email address');
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass('text-red-500');
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('is disabled when the disabled prop is passed', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('passes through standard input props', () => {
    const { container } = render(<Input type="password" name="user-password" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('name', 'user-password');
  });
});
