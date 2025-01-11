import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Game from './Game';
import { renderWithProviders } from '../../test/utils';

// Mock the messages
vi.mock('../i18n/en.json', () => ({
  default: {
    'game.loading': 'Loading...',
    'game.difficulty.easy': 'Easy',
    'game.difficulty.medium': 'Medium',
    'game.difficulty.hard': 'Hard',
    'game.newPuzzle': 'New Puzzle',
    'game.solve': 'Solve',
    'game.solving': 'Solving...',
  },
}));

// Mock SudokuGrid component
vi.mock('./SudokuGrid', () => ({
  default: vi.fn().mockImplementation(({ puzzle }) => (
    <div role="grid" data-testid="sudoku-grid">
      {JSON.stringify(puzzle)}
    </div>
  )),
}));

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Game Component', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Mock the initial puzzle fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ puzzle: Array(9).fill(Array(9).fill(null)) }),
    });
  });

  it('renders loading state initially', () => {
    renderWithProviders(<Game />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('loads and displays a puzzle', async () => {
    renderWithProviders(<Game />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if the puzzle grid is rendered
    expect(screen.getByTestId('sudoku-grid')).toBeInTheDocument();
  });

  it('changes difficulty when selected', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<Game />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Change difficulty
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'hard');

    // Verify the fetch was called with the new difficulty
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('difficulty=hard'));
  });

  it('handles solve puzzle request', async () => {
    const user = userEvent.setup();
    const mockPuzzle = Array(9).fill(Array(9).fill(null));
    const mockSolution = Array(9).fill(Array(9).fill(1));

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ puzzle: mockPuzzle }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ solution: mockSolution }),
      });

    renderWithProviders(<Game />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Click solve button
    const solveButton = screen.getByText('Solve');
    await user.click(solveButton);

    // Verify solve API was called
    expect(mockFetch).toHaveBeenCalledWith('/api/puzzle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ puzzle: mockPuzzle }),
    });
  });
});
