'use client';

import { useRef, RefObject } from 'react';
import { setElement, getIndex, inBounds, Grid } from '@/lib/engine/grid';
import { CELL_SIZE, ElementType } from '@/lib/engine/types';
import type { EngineState } from './useCanvasRenderer';

function interpolatePoints(x0: number, y0: number, x1: number, y1: number): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const steps = Math.max(dx, dy);
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    points.push({
      x: Math.round(x0 + (x1 - x0) * t),
      y: Math.round(y0 + (y1 - y0) * t),
    });
  }
  return points;
}

function drawAtPosition(
  grid: Grid,
  gridX: number,
  gridY: number,
  element: ElementType,
  brushSize: number
): void {
  const radius = Math.floor(brushSize / 2);
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius + radius) {
        const nx = gridX + dx;
        const ny = gridY + dy;
        if (inBounds(nx, ny, grid.width, grid.height)) {
          if (element === ElementType.Empty || grid.elements[getIndex(nx, ny, grid.width)] === ElementType.Empty) {
            setElement(grid, nx, ny, element);
          }
        }
      }
    }
  }
}

interface UseCanvasInputOptions {
  engineRef: RefObject<EngineState | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  brushSize: number;
  selectedElement: ElementType;
  onBrushSizeChange?: (size: number) => void;
}

export function useCanvasInput({
  engineRef,
  canvasRef,
  brushSize,
  selectedElement,
  onBrushSizeChange,
}: UseCanvasInputOptions) {
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const isErasingRef = useRef(false);

  const getGridCoordsFromClient = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    const gridX = Math.floor(canvasX / CELL_SIZE);
    const gridY = Math.floor(canvasY / CELL_SIZE);
    return { x: gridX, y: gridY };
  };

  const getGridCoords = (e: React.MouseEvent<HTMLCanvasElement>) => getGridCoordsFromClient(e.clientX, e.clientY);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine) return;

    const coords = getGridCoords(e);
    if (!coords) return;

    if (e.button === 0) {
      isDrawingRef.current = true;
      isErasingRef.current = false;
    } else if (e.button === 2) {
      isDrawingRef.current = true;
      isErasingRef.current = true;
    } else {
      return;
    }

    const el = (isErasingRef.current ? ElementType.Empty : selectedElement) === ElementType.Erase ? ElementType.Empty : (isErasingRef.current ? ElementType.Empty : selectedElement);
    drawAtPosition(engine.grid, coords.x, coords.y, el, brushSize);
    lastPosRef.current = coords;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const engine = engineRef.current;
    if (!engine) return;

    const coords = getGridCoords(e);
    if (!coords) return;

    const el = (isErasingRef.current ? ElementType.Empty : selectedElement) === ElementType.Erase ? ElementType.Empty : (isErasingRef.current ? ElementType.Empty : selectedElement);
    if (lastPosRef.current) {
      const points = interpolatePoints(lastPosRef.current.x, lastPosRef.current.y, coords.x, coords.y);
      for (const point of points) {
        drawAtPosition(engine.grid, point.x, point.y, el, brushSize);
      }
    } else {
      drawAtPosition(engine.grid, coords.x, coords.y, el, brushSize);
    }

    lastPosRef.current = coords;
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const handleMouseLeave = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const engine = engineRef.current;
    if (!engine) return;

    const touch = e.touches[0];
    const coords = getGridCoordsFromClient(touch.clientX, touch.clientY);
    if (!coords) return;

    isDrawingRef.current = true;
    isErasingRef.current = false;

    drawAtPosition(engine.grid, coords.x, coords.y, selectedElement, brushSize);
    lastPosRef.current = coords;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const engine = engineRef.current;
    if (!engine) return;

    const touch = e.touches[0];
    const coords = getGridCoordsFromClient(touch.clientX, touch.clientY);
    if (!coords) return;

    if (lastPosRef.current) {
      const points = interpolatePoints(lastPosRef.current.x, lastPosRef.current.y, coords.x, coords.y);
      for (const point of points) {
        drawAtPosition(engine.grid, point.x, point.y, selectedElement, brushSize);
      }
    } else {
      drawAtPosition(engine.grid, coords.x, coords.y, selectedElement, brushSize);
    }

    lastPosRef.current = coords;
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const next = brushSize + (e.deltaY < 0 ? 1 : -1);
    const clamped = Math.max(1, Math.min(20, next));
    if (onBrushSizeChange) onBrushSizeChange(clamped);
  };

  return {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onContextMenu: handleContextMenu,
    onWheel: handleWheel,
  };
}
