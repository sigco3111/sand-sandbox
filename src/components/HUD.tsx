'use client'

import { ElementType } from '@/lib/engine/types'

interface HUDProps {
  fps: number
  activeCells: number
  speed: number
  paused: boolean
  selectedElement: ElementType
  brushSize: number
}

const ELEMENT_NAMES: Record<number, string> = {
  [ElementType.Empty]: 'Empty',
  [ElementType.Sand]: 'Sand',
  [ElementType.Water]: 'Water',
  [ElementType.Stone]: 'Stone',
  [ElementType.Wall]: 'Wall',
  [ElementType.Fire]: 'Fire',
  [ElementType.Steam]: 'Steam',
  [ElementType.Oil]: 'Oil',
  [ElementType.Lava]: 'Lava',
  [ElementType.Wood]: 'Wood',
  [ElementType.Plant]: 'Plant',
  [ElementType.Acid]: 'Acid',
  [ElementType.Gunpowder]: 'Gunpowder',
  [ElementType.Ice]: 'Ice',
  [ElementType.Smoke]: 'Smoke',
  [ElementType.Spark]: 'Spark',
  [ElementType.Clone]: 'Clone',
  [ElementType.Erase]: 'Erase',
}

const ELEMENT_COLORS: Record<number, string> = {
  [ElementType.Sand]: '#D4A574',
  [ElementType.Water]: '#4A90D9',
  [ElementType.Stone]: '#808080',
  [ElementType.Wall]: '#555555',
  [ElementType.Fire]: '#FF4500',
  [ElementType.Steam]: '#C0C0C0',
  [ElementType.Oil]: '#8B6914',
  [ElementType.Lava]: '#FF2200',
  [ElementType.Wood]: '#8B6914',
  [ElementType.Plant]: '#228B22',
  [ElementType.Acid]: '#7FFF00',
  [ElementType.Gunpowder]: '#444444',
  [ElementType.Ice]: '#ADD8E6',
  [ElementType.Smoke]: '#696969',
  [ElementType.Spark]: '#FFD700',
  [ElementType.Clone]: '#9370DB',
  [ElementType.Erase]: '#FF4444',
}

const labelStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
const valueStyle: React.CSSProperties = { color: '#fff', fontSize: 11, fontWeight: 600 }

export default function HUD({ fps, activeCells, speed, paused, selectedElement, brushSize }: HUDProps) {
  const elColor = ELEMENT_COLORS[selectedElement] || '#fff'
  return (
    <div style={{
      position: 'absolute',
      top: 8,
      left: 8,
      background: 'rgba(10, 10, 20, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 8,
      padding: '8px 12px',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      pointerEvents: 'none',
      lineHeight: 1.5,
      border: '1px solid rgba(255, 255, 255, 0.06)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '2px 10px', alignItems: 'center' }}>
        <span style={labelStyle}>FPS</span>
        <span style={valueStyle}>{fps}</span>
        <span style={labelStyle}>Cells</span>
        <span style={valueStyle}>{activeCells.toLocaleString()}</span>
        <span style={labelStyle}>Speed</span>
        <span style={valueStyle}>{speed.toFixed(1)}x</span>
        <span style={labelStyle}>Brush</span>
        <span style={valueStyle}>{brushSize}</span>
        <span style={labelStyle}>Element</span>
        <span style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: elColor,
            boxShadow: `0 0 6px ${elColor}`,
            display: 'inline-block',
          }} />
          {ELEMENT_NAMES[selectedElement]}
        </span>
      </div>
      {paused && (
        <div style={{
          color: '#ff4444', fontWeight: 700, fontSize: 11,
          marginTop: 4, textAlign: 'center' as const,
          letterSpacing: '1px',
        }}>
          PAUSED
        </div>
      )}
    </div>
  )
}
