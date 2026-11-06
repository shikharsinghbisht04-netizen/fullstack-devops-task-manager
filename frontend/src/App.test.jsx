import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the heading and the add-task form', () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve([]) })));
    render(<App />);
    expect(screen.getByText('Task Manager')).toBeTruthy();
    expect(screen.getByPlaceholderText('New task')).toBeTruthy();
  });
});
