import React, { useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * Main App component for the Tic Tac Toe game.
 * Renders a centered interactive 3x3 grid, player indicator, game status, and new game/reset controls.
 */
function App() {
  // Board stores 9 cells: null, "X", or "O"
  const [board, setBoard] = useState(Array(9).fill(null));
  // true: X's turn, false: O's turn
  const [xIsNext, setXIsNext] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Check winner logic
  const calculateWinner = (squares) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8], // rows
      [0,3,6],[1,4,7],[2,5,8], // columns
      [0,4,8],[2,4,6] // diagonals
    ];
    for (let i=0; i<lines.length; i++) {
      const [a,b,c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(cell => cell != null);

  // Handles click on a cell
  const handleClick = (idx) => {
    if (!hasStarted) setHasStarted(true);
    if (board[idx] || winner) return;
    const next = board.slice();
    next[idx] = xIsNext ? 'X' : 'O';
    setBoard(next);
    setXIsNext(!xIsNext);
  };

  // Start a new game
  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setHasStarted(false);
  };

  // Status message
  let statusMsg;
  if (winner) {
    statusMsg = (
      <span>
        <span className="winner">{winner}</span> wins!
      </span>
    );
  } else if (isDraw) {
    statusMsg = <span>It's a <span className="draw">draw</span>!</span>;
  } else if (!hasStarted) {
    statusMsg = <span>Start playing!</span>;
  } else {
    statusMsg = (
      <span>
        <span style={{ color: xIsNext ? "var(--primary-color)" : "var(--accent-color)" }}>
          {xIsNext ? "X" : "O"}
        </span>
        &nbsp;turn
      </span>
    );
  }

  return (
    <div className="tictactoe-root">
      <main className="ttt-main">
        <header className="ttt-header">
          <h1 className="ttt-title">Tic Tac Toe</h1>
          <div className="ttt-status">{statusMsg}</div>
        </header>
        <Board 
          squares={board} 
          onClick={handleClick} 
          winner={winner} 
        />
        <div className="ttt-controls">
          <button className="ttt-btn" onClick={handleReset}>
            {hasStarted || winner || isDraw ? 'New Game' : 'Reset'}
          </button>
        </div>
        <footer className="ttt-footer">
          <span className="ttt-footnote">Modern Minimal Design &middot; React</span>
        </footer>
      </main>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Board component displays the 3x3 tic-tac-toe grid and handles player moves
 */
function Board({ squares, onClick, winner }) {
  // Highlight winning line
  const getWinningLine = (squares) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let i=0; i<lines.length; i++) {
      const [a,b,c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return [a, b, c];
      }
    }
    return [];
  };

  const winningLine = winner ? getWinningLine(squares) : [];

  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
      {squares.map((cell, idx) => (
        <Square 
          key={idx}
          value={cell}
          onClick={() => onClick(idx)}
          highlight={winningLine.includes(idx)}
        />
      ))}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Square component for individual cell in tic-tac-toe board.
 */
function Square({ value, onClick, highlight }) {
  return (
    <button 
      className={`ttt-square${highlight ? ' highlight' : ''}${value === 'X' ? ' x' : value === 'O' ? ' o' : ''}`}
      onClick={onClick}
      aria-label={`Cell${value ? ' ' + value : ''}`}
      tabIndex={0}
      disabled={Boolean(value)}
    >
      {value}
    </button>
  );
}

export default App;
