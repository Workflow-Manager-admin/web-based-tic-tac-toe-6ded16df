import React, { useState, useEffect } from 'react';
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

  // Game mode: "cpu" (vs computer) or "pvp" (vs player)
  const [gameMode, setGameMode] = useState(null); // null means not selected yet
  // Difficulty: "easy" | "hard"
  const [difficulty, setDifficulty] = useState('easy');

  // AI is always 'O'
  const cpuMark = 'O';
  // Player for vs cpu: 'X' is always the human

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

  // Difficulty AI - Easy: pick a random open square
  const getRandomMove = (currBoard) => {
    const open = currBoard.map((v, i) => v == null ? i : null).filter(i => i != null);
    if (open.length === 0) return null;
    const rnd = open[Math.floor(Math.random() * open.length)];
    return rnd;
  };

  // Difficulty AI - Hard: minimax
  function minimax(board, isMax, aiToken, plToken) {
    // Returns: {score, move}
    const win = calculateWinner(board);
    if (win === aiToken) return { score: 1 };
    if (win === plToken) return { score: -1 };
    if (!board.includes(null)) return { score: 0 };

    let best;
    if (isMax) {
      best = { score: -Infinity, move: null };
      for (let idx=0; idx<9; idx++) {
        if (board[idx] != null) continue;
        const next = board.slice();
        next[idx] = aiToken;
        const res = minimax(next, false, aiToken, plToken);
        if (res.score > best.score) {
          best = { score: res.score, move: idx };
        }
      }
    } else {
      best = { score: Infinity, move: null };
      for (let idx=0; idx<9; idx++) {
        if (board[idx] != null) continue;
        const next = board.slice();
        next[idx] = plToken;
        const res = minimax(next, true, aiToken, plToken);
        if (res.score < best.score) {
          best = { score: res.score, move: idx };
        }
      }
    }
    return best;
  }

  // CPU move logic, depending on difficulty. Only fires if cpu's turn
  useEffect(() => {
    if (gameMode !== "cpu") return;
    if (winner || isDraw) return;
    if (xIsNext) return; // only move for O (cpu)
    // CPU's turn
    let move = null;
    if (difficulty === "easy") {
      move = getRandomMove(board);
    } else if (difficulty === "hard") {
      // If first move of cpu, still randomize for variety
      if (board.filter(s => s).length < 2) {
        move = getRandomMove(board);
      } else {
        const result = minimax(board, true, cpuMark, "X");
        move = result.move;
      }
    }
    if (move != null) {
      // CPU "thinks": add small delay for UX
      const t = setTimeout(() => {
        handleClick(move, true);
      }, 380);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [xIsNext, board, gameMode, difficulty, winner, isDraw]);

  // Handles click on a cell, human always player X, cpu is O (if vs cpu)
  const handleClick = (idx, isCpuMove = false) => {
    if (!hasStarted) setHasStarted(true);
    if (board[idx] || winner) return;
    // If CPU, "xIsNext" should be false and cpuMark should be "O"
    if (gameMode === "cpu" && !isCpuMove && !xIsNext) return; // Ignore user clicking on cpu's turn
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

  // Mode and Difficulty selection handler
  const handleModeSelect = (mode) => {
    setGameMode(mode);
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setHasStarted(false);
  };

  const handleSetDifficulty = (diff) => {
    setDifficulty(diff);
    // If switching mid-game, only matters if cpu's turn
  };

  // UI - status message
  let statusMsg;
  if (!gameMode) {
    statusMsg = <span>Select a game mode</span>;
  } else if (winner) {
    statusMsg = (
      <span>
        <span className="winner">{winner}</span> wins!
      </span>
    );
  } else if (isDraw) {
    statusMsg = <span>It's a <span className="draw">draw</span>!</span>;
  } else if (!hasStarted) {
    statusMsg = (
      <span>
        {gameMode === "cpu" && <span>Move: <span style={{ color: "var(--primary-color)" }}>X</span> (You)</span>}
        {gameMode === "pvp" && <span>Start playing!</span>}
      </span>
    );
  } else {
    statusMsg = (
      <span>
        <span style={{ color: xIsNext ? "var(--primary-color)" : "var(--accent-color)" }}>
          {xIsNext ? "X" : "O"}
        </span>
        &nbsp;turn{gameMode === "cpu" && (xIsNext ? " (You)" : " (CPU)")}
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

        {!gameMode &&
        <div className="ttt-controls" style={{ marginBottom: 24 }}>
          <button className={`ttt-btn`} style={{marginRight:8}} onClick={() => handleModeSelect('cpu')}>Vs Computer</button>
          <button className={`ttt-btn ttt-btn-alt`} onClick={() => handleModeSelect('pvp')}>2 Players</button>
        </div>
        }

        {gameMode === "cpu" && (
          <DifficultySelector
            difficulty={difficulty}
            setDifficulty={handleSetDifficulty}
            disabled={hasStarted && !winner && !isDraw}
          />
        )}

        {gameMode &&
          <Board
            squares={board}
            onClick={handleClick}
            winner={winner}
          />
        }

        <div className="ttt-controls">
          {gameMode &&
            <button className="ttt-btn" onClick={handleReset}>
              {hasStarted || winner || isDraw ? 'New Game' : 'Reset'}
            </button>
          }
          {!gameMode &&
            <span style={{ flex: 1 }} />
          }
        </div>

        {gameMode &&
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button
              className="ttt-btn ttt-btn-alt"
              style={{
                background: "none",
                color: "#1976d2",
                border: "2px solid var(--primary-color)",
                padding: "6px 22px",
                fontWeight: 500,
                marginTop: 0
              }}
              onClick={() => setGameMode(null)}
            >
              &larr; Back to menu
            </button>
          </div>
        }
        <footer className="ttt-footer">
          <span className="ttt-footnote">Modern Minimal Design &middot; React</span>
        </footer>
      </main>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Difficulty selector for CPU opponent.
 */
function DifficultySelector({ difficulty, setDifficulty, disabled }) {
  return (
    <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
      <label style={{
        marginRight: 16,
        fontWeight: 600,
        fontSize: "1rem",
        color: "#1976d2",
        letterSpacing: "1px",
        background: "#eaf3fe",
        padding: "8px 18px",
        borderRadius: "24px"
      }}>
        Difficulty:
      </label>
      <button
        className="ttt-btn"
        style={{
          background: difficulty === "easy" ? "var(--accent-color)" : "var(--secondary-color)",
          color: difficulty === "easy" ? "#fff" : "#1976d2",
          marginRight: 8,
          border: difficulty === "easy" ? "none" : "2px solid var(--accent-color)",
          padding: "10px 26px"
        }}
        onClick={() => setDifficulty("easy")}
        disabled={disabled}
        aria-pressed={difficulty === "easy"}
      >
        Easy
      </button>
      <button
        className="ttt-btn"
        style={{
          background: difficulty === "hard" ? "var(--accent-color)" : "var(--secondary-color)",
          color: difficulty === "hard" ? "#fff" : "#1976d2",
          border: difficulty === "hard" ? "none" : "2px solid var(--accent-color)",
          padding: "10px 26px"
        }}
        onClick={() => setDifficulty("hard")}
        disabled={disabled}
        aria-pressed={difficulty === "hard"}
      >
        Hard
      </button>
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
