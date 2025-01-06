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
  
  // Create puzzle by removing numbers
  const puzzle = grid.map(row => [...row]);
  const cellsToRemove = 45; // Adjust difficulty by changing this number
  
  for (let i = 0; i < cellsToRemove; i++) {
    let row, col;
    do {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    } while (puzzle[row][col] === null);
    puzzle[row][col] = null;
  }
  
  return puzzle;
}

export async function GET() {
  const puzzle = generatePuzzle();
  return NextResponse.json({ puzzle });
}

export async function POST(request: Request) {
  const body = await request.json();
  const puzzleToSolve = body.puzzle;
  
  // Create a copy of the puzzle for solving
  const grid = puzzleToSolve.map((row: (number | null)[]) => 
    row.map(cell => cell === null ? 0 : cell)
  );
  
  solveSudoku(grid);
  
  return NextResponse.json({ solution: grid });
}
