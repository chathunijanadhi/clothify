import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and invokes the click handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to cart</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('preserves the native disabled behavior', () => {
    render(<Button disabled>Submitting</Button>);

    expect(screen.getByRole('button', { name: 'Submitting' })).toBeDisabled();
  });
});
