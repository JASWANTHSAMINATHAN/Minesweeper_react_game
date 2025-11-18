import React, { useEffect, useState } from "react";
import "./Minesweeper.css";
interface Props 
{
  rows: number;
  cols: number;
  mines: number;
}
export default function Minesweeper({ rows, cols, mines }: Props) 
{
  const [board, setBoard] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [flags, setFlags] = useState<boolean[][]>([]);
  const [gameover, setGameover] = useState(false);
  const [won, setWon] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [minesLeft, setMinesLeft] = useState(mines);
//Initializing
  useEffect(() => 
  {
    resetgame();
  }, []);
  useEffect(() => 
    {
    if (!gameover && !won) 
      {
      const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(timer);
      }
    }, [gameover, won]);
//resting game
  function resetgame()
  {
    const newBoard = generateboard(rows, cols, mines);
    setBoard(newBoard);
    setRevealed(Array(rows).fill(null).map(() => Array(cols).fill(false)));
    setFlags(Array(rows).fill(null).map(() => Array(cols).fill(false)));
    setGameover(false);
    setWon(false);
    setSeconds(0);
    setMinesLeft(mines);
  }

  // Board generation
  function generateboard(r: number, c: number, m: number) 
  {
    const grid = Array(r).fill(null).map(() => Array(c).fill(0));

    // placing mmines
    let placed = 0;
    while (placed < m) 
      {
      const row = Math.floor(Math.random() * r);
      const col = Math.floor(Math.random() * c);
      if (grid[row][col] !== -1) 
        {
        grid[row][col] = -1;
        placed++;
        }
      }

    // adding numbers of nearby mines
    const dirs = [
      [-1,-1],[-1,0],[-1,1],
      [0,-1],       [0,1],
      [1,-1],[1,0],[1,1]
    ];

    for (let i = 0; i < r; i++) 
      {
      for (let j = 0; j < c; j++) 
        {
        if (grid[i][j] === -1) continue;

        let count = 0;
        for (const [dx, dy] of dirs) 
          {
          const nx = i + dx, ny = j + dy;
          if (nx >= 0 && nx < r && ny >= 0 && ny < c && grid[nx][ny] === -1)
            count++;
          }
        grid[i][j] = count;
        }
      }
    return grid;
  }

  // revealing cells
  function revealcell(r: number, c: number) 
  {
    if (gameover || revealed[r][c] || flags[r][c]) 
      {
        return
      };
    const newrev = revealed.map((row) => [...row]);
    newrev[r][c] = true;
    setRevealed(newrev);
    if (board[r][c] === -1) 
      {
      setGameover(true);
      revealallonlose();
      return;
      }
    // auto reveal if count=0
    if (board[r][c] === 0)
      {
       revealEmpty(r, c, newrev);
      }
    checkWin();
  }

  function revealEmpty(r: number, c: number, newrev: boolean[][]) 
  {
    const stack = [[r, c]];
    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    while (stack.length) 
      {
      const [x, y] = stack.pop()!;
      for (const [dx, dy] of dirs) 
        {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && !newrev[nx][ny] && !flags[nx][ny]) 
        {
          newrev[nx][ny] = true;
          if (board[nx][ny] === 0)
            { 
              stack.push([nx, ny]);
            }
        }
      }
    }
    setRevealed([...newrev]);
  }

  // flagging cells
  function toggleflag(e: React.MouseEvent, r: number, c: number) 
  {
    e.preventDefault();
    if (gameover || revealed[r][c]) return;
    const newFlags = flags.map((row) => [...row]);
    newFlags[r][c] = !newFlags[r][c];
    setFlags(newFlags);
    setMinesLeft(mines - newFlags.flat().filter(Boolean).length);
  }
  // revelaing all mines on lossing
  function revealallonlose() 
  {
    const newrev = revealed.map((row) => [...row]);

    for (let i = 0; i < rows; i++) 
      {
      for (let j = 0; j < cols; j++) 
        {
        if (board[i][j] === -1 && !flags[i][j]) newrev[i][j] = true;
        }
      }
    setRevealed(newrev);
  }
  // checking win condition
  function checkWin() 
  {
    let revealedcount = 0;
    board.forEach((row, ridx) =>
      row.forEach((cell, cidx) => 
        {
        if (cell !== -1 && revealed[ridx][cidx]) revealedcount++;
        })
    );
    const totalsafe = rows * cols - mines;
    if (revealedcount === totalsafe) 
      {
      setWon(true);
      setGameover(true);
      }
  }
  // rendering
  return (
    <div className="wrapper">
      {/* Header */}
      <div className="header">
        <div className="counter">{minesLeft}</div>
        <button className="reset" onClick={resetgame}>
          {gameover ? "😵" : won ? "😎" : "🙂"}
        </button>
        <div className="counter">{seconds}</div>
      </div>

      {/* Grid */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 30px)` }}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isRev = revealed[r][c];
            const isFlag = flags[r][c];
            let display = "";
            if (!isRev && isFlag)
            {
              display = "🚩";
            }
            else if (isRev && cell === -1)
              { 
                display = "💣";
              }
            else if (isRev && cell > 0) 
              {
              display = cell.toString();
              }
            return (
              <div
                key={`${r}-${c}`}
                className={`cell ${isRev ? "open" : ""}`}
                onClick={() => revealcell(r, c)}
                onContextMenu={(e) => toggleflag(e, r, c)}
              >
                {/* Wrong flag →❌*/}
                {gameover && isFlag && cell !== -1 ? "❌" : display}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
