import { useEffect, useRef, useState } from "react";

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 12;
const INITIAL_SNAKE = [
  { x: 5, y: 6 },
  { x: 4, y: 6 },
  { x: 3, y: 6 }
];

const createFood = (snake) => {
  const emptyCells = [];
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) {
        emptyCells.push({ x, y });
      }
    }
  }
  return emptyCells.length
    ? emptyCells[Math.floor(Math.random() * emptyCells.length)]
    : null;
};

const createGame = () => ({
  snake: INITIAL_SNAKE.map((segment) => ({ ...segment })),
  food: createFood(INITIAL_SNAKE),
  direction: { x: 1, y: 0 },
  score: 0,
  status: "playing"
});

const SnakeGame = ({ onExit }) => {
  const [game, setGame] = useState(createGame);
  const gameRef = useRef(game);

  const updateGame = (nextGame) => {
    gameRef.current = nextGame;
    setGame(nextGame);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onExit();
        return;
      }

      const directions = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };
      const nextDirection = directions[event.key];
      if (!nextDirection) return;

      event.preventDefault();
      const current = gameRef.current;
      if (
        nextDirection.x + current.direction.x === 0 &&
        nextDirection.y + current.direction.y === 0
      ) {
        return;
      }
      updateGame({ ...current, direction: nextDirection });
    };

    const interval = window.setInterval(() => {
      const current = gameRef.current;
      if (current.status !== "playing") return;

      const head = current.snake[0];
      const nextHead = {
        x: head.x + current.direction.x,
        y: head.y + current.direction.y
      };
      const eating = nextHead.x === current.food?.x && nextHead.y === current.food?.y;
      const body = eating ? current.snake : current.snake.slice(0, -1);
      const hitWall =
        nextHead.x < 0 ||
        nextHead.x >= BOARD_WIDTH ||
        nextHead.y < 0 ||
        nextHead.y >= BOARD_HEIGHT;

      if (hitWall || body.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y)) {
        updateGame({ ...current, status: "over" });
        return;
      }

      const snake = [nextHead, ...body];
      const food = eating ? createFood(snake) : current.food;
      updateGame({
        ...current,
        snake,
        food,
        score: current.score + Number(eating),
        status: food ? "playing" : "won"
      });
    }, 140);

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onExit]);

  const restart = () => updateGame(createGame());

  return (
    <section className="snake-game" aria-label="Snake game">
      <div className="snake-game-header">
        <strong>Snake</strong>
        <span>Score: {game.score}</span>
      </div>
      <div
        className="snake-game-board"
        role="img"
        aria-label={`Snake game board. Score: ${game.score}.`}
      >
        {Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, (_, index) => {
          const x = index % BOARD_WIDTH;
          const y = Math.floor(index / BOARD_WIDTH);
          const isSnake = game.snake.some((segment) => segment.x === x && segment.y === y);
          const isFood = game.food?.x === x && game.food?.y === y;
          return (
            <span
              className={`snake-game-cell${isSnake ? " is-snake" : ""}${isFood ? " is-food" : ""}`}
              key={index}
            />
          );
        })}
      </div>
      <p className="snake-game-message" aria-live="polite">
        {game.status === "playing"
          ? "Use arrow keys to move. Press Esc to exit."
          : game.status === "won"
            ? "Board cleared! You won."
            : "Game over."}
      </p>
      <div className="snake-game-actions">
        {game.status !== "playing" && (
          <button type="button" onClick={restart}>Play again</button>
        )}
        <button type="button" onClick={onExit}>Exit game</button>
      </div>
    </section>
  );
};

export default SnakeGame;
