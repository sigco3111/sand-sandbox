'use client';

import { useRef, useEffect, useState } from 'react';
import { createGrid } from '@/lib/engine/grid';
import { createRNG } from '@/lib/engine/random';
import { createSimulator } from '@/lib/engine/simulator';
import { createImageData, renderGrid } from '@/lib/renderer/canvas';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, ElementType } from '@/lib/engine/types';

type BgColor = [number, number, number];

export interface EngineState {
  grid: ReturnType<typeof createGrid>;
  rng: ReturnType<typeof createRNG>;
  simulator: ReturnType<typeof createSimulator>;
  imageData: ImageData;
}

interface UseCanvasRendererOptions {
  speed: number;
  paused: boolean;
  width: number;
  height: number;
  bgColor?: BgColor;
}

export function useCanvasRenderer({ speed, paused, width, height, bgColor }: UseCanvasRendererOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<EngineState | null>(null);
  const rafRef = useRef<number | null>(null);
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });
  const bgColorRef = useRef(bgColor);
  bgColorRef.current = bgColor;

  const [fps, setFps] = useState(0);
  const [activeCells, setActiveCells] = useState(0);

  // Initialize engine in a lazy pattern to survive StrictMode double-mount
  if (!engineRef.current) {
    const grid = createGrid(GRID_WIDTH, GRID_HEIGHT);
    const rng = createRNG(42);
    const simulator = createSimulator(grid, rng);
    const imageData = createImageData(GRID_WIDTH, GRID_HEIGHT, CELL_SIZE);

    engineRef.current = {
      grid,
      rng,
      simulator,
      imageData,
    };
  }

  useEffect(() => {
    engineRef.current?.simulator.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    if (paused) engineRef.current?.simulator.pause();
    else engineRef.current?.simulator.resume();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = engineRef.current;
    if (!engine) return;

    const animate = () => {
      // Step the simulation
      if (!paused) {
        const steps = Math.round(speed);
        for (let i = 0; i < steps; i++) {
          engine.simulator.step();
        }
      }

      // Render the grid to imageData
      renderGrid(engine.grid, engine.imageData, bgColorRef.current);

      // Put the image data on the canvas
      ctx.putImageData(engine.imageData, 0, 0);

      // FPS counter
      const fpsData = fpsCounterRef.current;
      fpsData.frames++;
      const now = performance.now();
      if (now - fpsData.lastTime >= 1000) {
        setFps(fpsData.frames);
        let count = 0;
        const elements = engine.grid.elements;
        for (let i = 0; i < elements.length; i++) {
          if (elements[i] !== ElementType.Empty) count++;
        }
        setActiveCells(count);
        fpsData.frames = 0;
        fpsData.lastTime = now;
      }

      // Request next frame
      rafRef.current = requestAnimationFrame(animate);
    };

    // Start the animation loop
    rafRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { canvasRef, engineRef, fps, activeCells };
}
