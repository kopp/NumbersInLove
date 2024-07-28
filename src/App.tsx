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

function makeInitialGrid(
  numberOfRows: number,
  numberOfColumns: number,
  level: number
): Grid {
  return addRandomPairs(
    makeEmptyGrid(numberOfRows, numberOfColumns),
    3 * level
  );
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
    setGrid(makeInitialGrid(numberOfRows, numberOfColumns, level));
  }, [numberOfRows, numberOfColumns, level]);

  // make new pairs appear, faster the higher the level is
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isWon(grid)) {
        setGrid(addRandomPairs(grid, 1));
      }
    }, 6000 / level); // Faster with higher levels
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
    if (secondValue == null) {
      console.error("Value at", row, column, "was", grid[row][column]);
      return;
    }

    if (firstValue + secondValue === 10) {
      const newGrid = [...grid];
      newGrid[selectedCell.row][selectedCell.column] = undefined;
      newGrid[row][column] = undefined;
      setGrid(newGrid);
      setSelectedCell(undefined);
    }
  }

  // Remember to call addRandomPairs in useEffect when the component mounts or level changes

  function handleChangeRows(e: React.ChangeEvent<HTMLSelectElement>) {
    const rows = parseInt(e.target.value);
    if (isNaN(rows)) {
      return;
    }
    setRows(rows);
  }

  function handleChangeColumns(e: React.ChangeEvent<HTMLSelectElement>) {
    const columns = parseInt(e.target.value);
    if (isNaN(columns)) {
      return;
    }
    setColumns(columns);
  }

  function handleChangeLevel(e: React.ChangeEvent<HTMLSelectElement>) {
    setLevel(parseInt(e.target.value));
  }

  const isSelected = (row: number, column: number) => {
    if (!selectedCell) return false;
    return selectedCell.row === row && selectedCell.column === column;
  };

  const gridDiv = (
    <div
      className="grid"
      style={{ gridTemplateColumns: "auto ".repeat(numberOfRows) }}
    >
      {grid.map((row, rowIndex) => (
        <>
          {row.map((cell, columnIndex) => (
            <div
              key={1000 * rowIndex + columnIndex}
              className={`cell ${
                isSelected(rowIndex, columnIndex) ? "cell-selected" : ""
              } ${isEmpty(cell) ? "cell-empty" : ""}`}
              onClick={() => handleCellClick(rowIndex, columnIndex)}
            >
              {isEmpty(cell) ? "" : cell}
            </div>
          ))}
        </>
      ))}
    </div>
  );

  const MAX_LEVEL = 10;
  const levelChoices = [];
  for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
    const stars = "⭐".repeat(lvl);
    levelChoices.push(<option value={lvl}>{stars}</option>);
  }

  const MAX_ROWS = 20;
  const rowChoices = [];
  for (let row = 3; row <= MAX_ROWS; row++) {
    rowChoices.push(<option value={row}>{row}</option>);
  }

  const MAX_COLUMNS = 14;
  const columnChoices = [];
  for (let column = 3; column <= MAX_COLUMNS; column++) {
    columnChoices.push(<option value={column}>{column}</option>);
  }

  const youWonDiv = (
    <div>
      <h1>🥳</h1>
      <button onClick={() => setLevel(level + (level < MAX_LEVEL ? 1 : 0))}>
        ↑⭐
      </button>
      <button
        onClick={() =>
          setGrid(makeInitialGrid(numberOfRows, numberOfColumns, level))
        }
      >
        ↺
      </button>
    </div>
  );

  return (
    <div className="App">
      <h1>3❤️7</h1>
      <div>
        <label htmlFor="numberOfRows">‖‖</label>
        <select
          id="numberOfRows"
          value={numberOfRows}
          onChange={handleChangeRows}
          style={{ width: "4em" }}
        >
          {rowChoices}
        </select>
        &nbsp; &nbsp;
        <label htmlFor="numberOfColumns">☰</label>
        <select
          id="numberOfColumns"
          value={numberOfColumns}
          onChange={handleChangeColumns}
          style={{ width: "4em" }}
        >
          {columnChoices}
        </select>
      </div>
      <div>
        <label htmlFor="level">🤔</label>
        <select id="level" value={level} onChange={handleChangeLevel}>
          {levelChoices}
        </select>
      </div>
      {isWon(grid) ? youWonDiv : gridDiv}
    </div>
  );
}

export default App;
