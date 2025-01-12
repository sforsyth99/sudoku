import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Difficulty = 'easy' | 'medium' | 'hard';

const fetchPuzzle = async (difficulty: Difficulty) => {
  const response = await fetch(`/api/puzzle?difficulty=${difficulty}`);
  if (!response.ok) {
    throw new Error('Failed to fetch puzzle');
  }
  const data = await response.json();
  return data.puzzle;
};

const solvePuzzle = async (puzzle: (number | null)[][]) => {
  const response = await fetch('/api/puzzle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ puzzle }),
  });
  if (!response.ok) {
    throw new Error('Failed to solve puzzle');
  }
  const data = await response.json();
  return data.solution;
};

export function usePuzzle(difficulty: Difficulty) {
  return useQuery({
    queryKey: ['puzzle', difficulty],
    queryFn: () => fetchPuzzle(difficulty),
  });
}

export function useSolvePuzzle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: solvePuzzle,
    onSuccess: (solution) => {
      // Get the current query key from the cache
      const currentQueries = queryClient.getQueryCache().findAll({
        queryKey: ['puzzle'],
      });
      // Update all puzzle queries with the solution
      currentQueries.forEach(query => {
        queryClient.setQueryData(query.queryKey, solution);
      });
    },
  });
}
