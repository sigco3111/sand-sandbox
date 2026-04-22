'use client';

import { useCallback, useEffect } from 'react';
import { ElementType } from '@/lib/engine/types';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer';
import { useCanvasInput } from '@/hooks/useCanvasInput';
import HUD from './HUD';

interface SimulationCanvasProps {
  selectedElement: ElementType;
  brushSize: number;
  speed: number;
  paused: boolean;
  clearRequest: number;
  bgColor?: [number, number, number];
  onSelectElement: (element: ElementType) => void;
  onBrushSizeChange: (size: number) => void;
  onTogglePause: () => void;
  onClear: () => void;
  onSpeedChange: (delta: number) => void;
  width: number;
  height: number;
}

export default function SimulationCanvas({
  selectedElement = ElementType.Sand,
  brushSize = 3,
  speed = 1,
  paused = false,
  clearRequest = 0,
  bgColor,
  onSelectElement,
  onBrushSizeChange,
  onTogglePause,
  onClear,
  onSpeedChange,
  width,
  height
}: SimulationCanvasProps) {
  const { canvasRef, engineRef, fps, activeCells } = useCanvasRenderer({ speed, paused, width, height, bgColor });

  useEffect(() => {
    if (clearRequest > 0) {
      engineRef.current?.simulator.clear();
    }
  }, [clearRequest]);

  const inputHandlers = useCanvasInput({
    engineRef,
    canvasRef,
    brushSize,
    selectedElement,
    onBrushSizeChange,
  });

  const handleTogglePause = useCallback(() => { if (onTogglePause) onTogglePause(); }, [onTogglePause]);
  const handleClear = useCallback(() => {
    if (onClear) onClear();
    engineRef.current?.simulator.clear();
  }, [onClear]);
  const handleSpeedChange = useCallback((delta: number) => {
    if (onSpeedChange) onSpeedChange(delta);
  }, [onSpeedChange]);
  const handleSelectElement = useCallback((element: ElementType) => {
    if (onSelectElement) onSelectElement(element);
  }, [onSelectElement]);

  useKeyboard({
    onSelectElement: handleSelectElement,
    onTogglePause: handleTogglePause,
    onClear: handleClear,
    onSpeedChange: handleSpeedChange,
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        {...inputHandlers}
        style={{
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'block',
          imageRendering: 'pixelated',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      <HUD
        fps={fps}
        activeCells={activeCells}
        speed={speed}
        paused={paused}
        selectedElement={selectedElement}
        brushSize={brushSize}
      />
    </div>
  );
}
