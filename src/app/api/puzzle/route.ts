import { NextResponse } from 'next/server';

function generateEmptyGrid(): (number | null)[][] {
  return Array(9).fill(null).map(() => Array(9).fill(0));
}

function isValid(grid: (number | null)[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }
  
  // Check 3x3 box
  let startRow = row - row % 3;
  let startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }
  
  return true;
}

function solveSudoku(grid: (number | null)[][]): boolean {
  let row = -1;
  let col = -1;
  let isEmpty = false;
  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) {
        row = i;
        col = j;
        isEmpty = true;
        break;
      }
    }
    if (isEmpty) break;
  }
  
  if (!isEmpty) return true;
  
  for (let num = 1; num <= 9; num++) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      if (solveSudoku(grid)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

//TODO this could be renamed to "has more than one solution" or similar.
function countSolutions(grid: (number | null)[][], solutions: { count: number } = { count: 0 }): number {
  if (solutions.count > 1) return solutions.count; // Early return if we already found multiple solutions
  
  let row = -1;
  let col = -1;
  let isEmpty = false;
  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0 || grid[i][j] === null) {
        row = i;
        col = j;
        isEmpty = true;
        break;
      }
    }
    if (isEmpty) break;
  }
  
  if (!isEmpty) {
    solutions.count++;
    return solutions.count;
  }
  
  for (let num = 1; num <= 9; num++) {
    if (solutions.count > 1) break; // Stop trying more numbers if we already found multiple solutions
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      countSolutions(grid, solutions);
      grid[row][col] = 0;
    }
  }
  
  return solutions.count;
}

function generatePuzzle(): (number | null)[][] {
  const grid = generateEmptyGrid();
  
  // Fill diagonal 3x3 boxes
  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        let num;
        do {
          num = Math.floor(Math.random() * 9) + 1;
        } while (!isValid(grid, i + j, i + k, num));
        grid[i + j][i + k] = num;
      }
    }
  }
  
  // Solve the rest of the puzzle
  solveSudoku(grid);
  
  // Create puzzle by removing numbers while ensuring unique solution
  const puzzle = grid.map(row => [...row]);
  const positions = Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9]);
  
  // Shuffle positions for random removal
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  let cellsRemoved = 0;
  const targetCellsToRemove = 45; // Adjust difficulty by changing this number
  
  for (const [row, col] of positions) {
    if (cellsRemoved >= targetCellsToRemove) break;
    
    const temp = puzzle[row][col];
    puzzle[row][col] = null;
    
    // Create a copy for solution counting
    const puzzleCopy = puzzle.map(row => row.map(cell => cell === null ? 0 : cell));
    
    // If removing this number creates multiple solutions, put it back
    if (countSolutions(puzzleCopy) !== 1) {
      puzzle[row][col] = temp;
    } else {
      cellsRemoved++;
    }
  }
  
  return puzzle;
}

export async function GET() {
  const puzzle = generatePuzzle();
  return NextResponse.json({ puzzle });
}
