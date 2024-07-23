import React, { useState, useEffect } from "react";
import "./App.css";

interface CellIndex {
  row: number;
  column: number;
}

type GridCell = number | undefined;
type Grid = Array<Array<GridCell>>;

function isEmpty(cell: GridCell) {
  return cell === undefined;
}

function makeEmptyGrid(rows: number, columns: number): Grid {
  return Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(undefined));
}

/// Add `numPairs` random pairs to the grid or if `numPairs` is undefined, add
/// as many pairs as possible. This does not mutate the original grid, but
/// returns a new grid.
function addRandomPairs(grid: Grid, numPairs?: number): Grid {
  const numberOfRows = grid.length;
  const numberOfColumns = grid[0].length;

  const newGrid = grid.map((row) => [...row]); // deep copy

  // Find all available spaces
  const availableSpaces: Array<CellIndex> = [];
  for (let i = 0; i < numberOfRows; i++) {
    for (let j = 0; j < numberOfColumns; j++) {
      if (isEmpty(newGrid[i][j])) {
        availableSpaces.push({ row: i, column: j });
      }
    }
  }

  // Shuffle available spaces to randomize pair placement
  availableSpaces.sort(() => Math.random() - 0.5);

  // Add pairs if there's enough space
  const numPairsToAdd = numPairs ?? Math.floor(availableSpaces.length / 2);
  if (numPairsToAdd > 0) {
    for (let pair = 0; pair < numPairsToAdd; pair++) {
      const i = pair * 2;
      if (i + 1 < availableSpaces.length) {
        const firstNum = Math.floor(Math.random() * 6); // 0 to 5
        const secondNum = 10 - firstNum;
        const firstPos = availableSpaces[i];
        const secondPos = availableSpaces[i + 1];

        newGrid[firstPos.row][firstPos.column] = firstNum;
        newGrid[secondPos.row][secondPos.column] = secondNum;
      }
    }
  }

  return newGrid;
}

/// check whether the grid is empty
function isWon(grid: Grid): boolean {
  return grid.every((row) => row.every((cell) => isEmpty(cell)));
}

function App() {
  const [numberOfRows, setRows] = useState(5);
  const [numberOfColumns, setColumns] = useState(5);
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<Grid>(
    makeEmptyGrid(numberOfRows, numberOfColumns)
  );
  const [selectedCell, setSelectedCell] = useState<CellIndex | undefined>(
    undefined
  );

  useEffect(() => {
    setGrid(
      addRandomPairs(makeEmptyGrid(numberOfRows, numberOfColumns), 3 * level)
    );
  }, [numberOfRows, numberOfColumns, level]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isWon(grid)) {
        setGrid(addRandomPairs(grid, 1));
      }
    }, 3000 / level); // Faster with higher levels
    return () => clearInterval(interval);
  }, [grid, level]);

  function handleCellClick(row: number, column: number) {
    console.log("Click to", row, column, "with content", grid[row][column]);
    // click to empty cell clears selection
    if (isEmpty(grid[row][column])) {
      setSelectedCell(undefined);
      return;
    }

    // click to the same cell clears selection
    if (
      selectedCell &&
      selectedCell.row === row &&
      selectedCell.column === column
    ) {
      setSelectedCell(undefined);
      return;
    }

    // nothing selected yet -> select
    if (selectedCell === undefined) {
      setSelectedCell({ row: row, column: column });
      return;
    }

    // second cell selected, now let's see if the selected ones match
    const firstValue = grid[selectedCell.row][selectedCell.column];
    if (firstValue === undefined) {
      console.error(
        "Internal error: first cell is undefined; grid is",
        grid,
        "selectedCell is",
        selectedCell,
        "row, column",
        row,
        column
      );
      return;
    }
    const secondValue = grid[row][column];

    if (firstValue + secondValue === 10) {
      const newGrid = [...grid];
      newGrid[selectedCell.row][selectedCell.column] = undefined;
      newGrid[row][column] = undefined;
      setGrid(newGrid);
      setSelectedCell(undefined);
    }
  }

  // Remember to call addRandomPairs in useEffect when the component mounts or level changes

  function handleChangeRows(e: React.ChangeEvent<HTMLInputElement>) {
    const rows = parseInt(e.target.value);
    console.log("Changing rows to", rows);
    setRows(rows);
  }

  function handleChangeColumns(e: React.ChangeEvent<HTMLInputElement>) {
    setColumns(parseInt(e.target.value));
  }

  function handleChangeLevel(e: React.ChangeEvent<HTMLSelectElement>) {
    setLevel(parseInt(e.target.value));
  }

  const isSelected = (row: number, column: number) => {
    if (!selectedCell) return false;
    return selectedCell.row === row && selectedCell.column === column;
  };

  const gridDiv = (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, columnIndex) => (
            <div
              key={columnIndex}
              className={`cell ${
                isSelected(rowIndex, columnIndex) ? "cell-selected" : ""
              } ${isEmpty(cell) ? "cell-empty" : ""}`}
              onClick={() => handleCellClick(rowIndex, columnIndex)}
            >
              {isEmpty(cell) ? "" : cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const youWonDiv = (
    <div>
      <h1>🥳</h1>
      <button onClick={() => setLevel(level + 1)}>↺</button>
    </div>
  );

  return (
    <div className="App">
      <h1>3❤️7 &nbsp; 2❤️8 &nbsp; 1❤️9 </h1>
      <div>
        <label htmlFor="numberOfRows">‖‖</label>
        <input
          id="numberOfRows"
          type="number"
          value={numberOfRows}
          onChange={handleChangeRows}
          style={{ width: "4em" }}
        />
        &nbsp; &nbsp;
        <label htmlFor="numberOfColumns">☰</label>
        <input
          id="numberOfColumns"
          type="number"
          value={numberOfColumns}
          onChange={handleChangeColumns}
          style={{ width: "4em" }}
        />
      </div>
      <div>
        <label htmlFor="level">🤔</label>
        <select id="level" value={level} onChange={handleChangeLevel}>
          <option value="1">⭐</option>
          <option value="2">⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
        </select>
      </div>
      {isWon(grid) ? youWonDiv : gridDiv}
    </div>
  );
}

export default App;
