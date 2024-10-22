import React, { useEffect } from "react";

const boing = "https://www.myinstants.com/media/sounds/smoke-detector-beep.mp3";

const CanvasThing: React.FC<{
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onLoad?: () => void;
}> = ({ canvasRef, onLoad }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrameId: number;
    const ball = {
      x: 50,
      y: 50,
      dx: Math.random() * 2 + 1,
      dy: Math.random() * 2 + 1,
      radius: 30,
    };

    const drawBall = () => {
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "yellow";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      context.fillStyle = "blue";
      context.fill();
      context.closePath();
    };

    const playSound = () => {
      const audio = new Audio(boing);
      audio.play();
    };

    const updateBallPosition = () => {
      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0 || ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        const direction = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 5 + 2;
        ball.x = canvas.width * Math.random();
        ball.y = canvas.height * Math.random();
        ball.dx = Math.cos(direction) * speed;
        ball.dy = Math.sin(direction) * speed;
        playSound();
      }

      ball.dy += 0.1;
    };

    const render = () => {
      drawBall();
      updateBallPosition();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    onLoad?.();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef, onLoad]);

  return <canvas ref={canvasRef} width={500} height={500} />;
};

export default CanvasThing;
