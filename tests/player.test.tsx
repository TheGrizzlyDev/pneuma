import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PlayerPage } from '../src/pages/PlayerPage';
import { StoreProvider } from '../src/ui/hooks/useStore';

const renderPlayer = () =>
  render(
    <StoreProvider>
      <MemoryRouter initialEntries={['/player?exerciseId=resonance-5-5']}>
        <Routes>
          <Route path="/player" element={<PlayerPage />} />
        </Routes>
      </MemoryRouter>
    </StoreProvider>
  );

describe('PlayerPage', () => {
  it('renders the player header', () => {
    renderPlayer();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText(/Resonance 5–5/)).toBeInTheDocument();
  });
});
