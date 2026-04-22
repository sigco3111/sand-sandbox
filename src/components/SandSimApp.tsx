'use client'

import { ElementType } from '@/lib/engine/types'
import SimulationCanvas from './SimulationCanvas'
import Toolbar from './Toolbar'
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE } from '@/lib/engine/types'
import { useState, useCallback } from 'react'

export default function SandSimApp() {
  const [selectedElement, setSelectedElement] = useState<ElementType>(ElementType.Sand)
  const [brushSize, setBrushSize] = useState(3)
  const [speed, setSpeed] = useState(1)
  const [paused, setPaused] = useState(false)
  const [clearRequest, setClearRequest] = useState(0)
  const [bgColor, setBgColor] = useState<[number, number, number]>([15, 15, 26])

  const handleSelectElement = useCallback((element: ElementType) => {
    setSelectedElement(element)
  }, [])

  const handleBrushSizeChange = useCallback((size: number) => {
    setBrushSize(size)
  }, [])

  const handleTogglePause = useCallback(() => {
    setPaused(p => !p)
  }, [])

  const handleClear = useCallback(() => {
    setClearRequest(c => c + 1)
  }, [])

  const handleSpeedChange = useCallback((delta: number) => {
    setSpeed(s => Math.max(0.5, Math.min(3, s + delta)))
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#0a0a14',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '140px',
    }}>
      <div style={{ position: 'relative' }}>
        <SimulationCanvas
          selectedElement={selectedElement}
          brushSize={brushSize}
          speed={speed}
          paused={paused}
          clearRequest={clearRequest}
          bgColor={bgColor}
          onSelectElement={handleSelectElement}
          onBrushSizeChange={handleBrushSizeChange}
          onTogglePause={handleTogglePause}
          onClear={handleClear}
          onSpeedChange={handleSpeedChange}
          width={GRID_WIDTH * CELL_SIZE}
          height={GRID_HEIGHT * CELL_SIZE}
        />
      </div>
      <Toolbar
        selectedElement={selectedElement}
        brushSize={brushSize}
        bgColor={bgColor}
        onSelectElement={handleSelectElement}
        onBrushSizeChange={handleBrushSizeChange}
        onClear={handleClear}
        onTogglePause={handleTogglePause}
        onBgColorChange={setBgColor}
        paused={paused}
      />
    </div>
  )
}