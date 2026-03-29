"use client";

import { useEffect, useRef, useState } from "react";

interface PixelBackgroundProps {
  desktopSrc: string;
  mobileSrc: string;
}

// Colors identified from the Mondrian-style background images
const PALETTE = ["#F5F5F0", "#000000", "#C41E3A", "#607D8B", "#FFD700"];

export default function PixelBackground({ desktopSrc, mobileSrc }: PixelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(desktopSrc);
  const [opacity, setOpacity] = useState(1);
  const [pixelData, setPixelData] = useState<string[][] | null>(null);

  useEffect(() => {
    const updateSrc = () => {
      if (window.innerWidth < 768) {
        setCurrentSrc(mobileSrc);
      } else {
        setCurrentSrc(desktopSrc);
      }
    };

    updateSrc();
    window.addEventListener("resize", updateSrc);
    return () => window.removeEventListener("resize", updateSrc);
  }, [desktopSrc, mobileSrc]);

  useEffect(() => {
    const img = new Image();
    img.src = currentSrc;
    img.onload = () => {
      // Create a small off-screen canvas to sample the image
      const sampleCanvas = document.createElement("canvas");
      const sampleCtx = sampleCanvas.getContext("2d");
      if (sampleCtx) {
        const cellSize = 30;
        const cols = Math.ceil(window.innerWidth / cellSize);
        const rows = Math.ceil(window.innerHeight / cellSize);
        
        sampleCanvas.width = cols;
        sampleCanvas.height = rows;
        sampleCtx.drawImage(img, 0, 0, cols, rows);
        
        const imageData = sampleCtx.getImageData(0, 0, cols, rows).data;
        const colors: string[][] = [];
        
        for (let y = 0; y < rows; y++) {
          colors[y] = [];
          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            colors[y][x] = `rgb(${r}, ${g}, ${b})`;
          }
        }
        setPixelData(colors);
      }

      // Small delay for the animation effect
      setTimeout(() => {
        setImageLoaded(true);
        const fadeOut = setInterval(() => {
          setOpacity((prev) => {
            if (prev <= 0) {
              clearInterval(fadeOut);
              setShowImage(true);
              return 0;
            }
            return prev - 0.05;
          });
        }, 30);
      }, 1000); // 1s delay
    };
  }, [currentSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = Date.now();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cellSize = 30;
      const cols = Math.ceil(canvas.width / cellSize);
      const rows = Math.ceil(canvas.height / cellSize);

      const waveSpeed = 1.5;

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          // Wave travels from top-left to bottom-right
          const distance = (x + y) / (cols + rows);
          const waveFront = elapsed * waveSpeed;
          const intensity = Math.max(0, Math.min(1, waveFront - distance * 1.5));

          if (intensity > 0) {
            // If we have sampled pixel data, use it. 
            // Otherwise use a random color from the palette.
            if (pixelData && pixelData[y] && pixelData[y][x]) {
              ctx.fillStyle = pixelData[y][x];
            } else {
              // Deterministic seed based on coordinates so colors don't flicker
              const seed = (x * 13 + y * 7) % PALETTE.length;
              ctx.fillStyle = PALETTE[seed];
            }
            
            // Pixels "pop" in with an animation
            const scale = Math.min(1, intensity * 2);
            const size = (cellSize - 1) * scale;
            const offset = (cellSize - size) / 2;
            
            ctx.fillRect(
              x * cellSize + offset, 
              y * cellSize + offset, 
              size, 
              size
            );
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pixelData]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-[#F5F5F0]">
      {/* The actual background image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundImage: `url('${currentSrc}')` }}
      />
      
      {/* The canvas-based pixel loading animation */}
      {!showImage && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: opacity }}
        />
      )}
    </div>
  );
}
