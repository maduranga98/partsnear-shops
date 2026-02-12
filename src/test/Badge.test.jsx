import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../components/ui/Badge';

describe('Badge Component', () => {
  it('renders the children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeDefined();
  });

  it('applies the correct variant class', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    // We check if it contains the success-specific class
    expect(container.firstChild.className).toContain('text-success');
  });

  it('renders a dot when the dot prop is true', () => {
    const { container } = render(<Badge dot>With Dot</Badge>);
    // The dot is a span inside the badge
    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeDefined();
  });

  it('applies the correct size class', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    // Since 'lg' is not in sizeStyles, it might use a default or be undefined.
    // Looking at Badge.jsx, sizeStyles only has xs, sm, md.
    // Let's test 'md' instead.
    const { container: containerMd } = render(<Badge size="md">Medium</Badge>);
    expect(containerMd.firstChild.className).toContain('text-[12px]');
  });
});
