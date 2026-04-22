'use client'

import { ElementType } from '@/lib/engine/types'

interface ToolbarProps {
  selectedElement: ElementType
  brushSize: number
  bgColor: [number, number, number]
  onSelectElement: (element: ElementType) => void
  onBrushSizeChange: (size: number) => void
  onClear: () => void
  onTogglePause: () => void
  onBgColorChange: (c: [number, number, number]) => void
  paused: boolean
}

const BG_PRESETS: { label: string; color: [number, number, number] }[] = [
  { label: 'Navy', color: [15, 15, 26] },
  { label: 'Black', color: [0, 0, 0] },
  { label: 'Gray', color: [30, 30, 30] },
  { label: 'Blue', color: [10, 15, 40] },
  { label: 'Green', color: [10, 25, 15] },
  { label: 'Purple', color: [25, 10, 35] },
  { label: 'White', color: [240, 240, 240] },
]

const CATEGORIES: { label: string; accent: string; elements: { t: ElementType; n: string; k: string }[] }[] = [
  { label: 'Powder', accent: '#D4A574', elements: [
    { t: ElementType.Sand, n: 'Sand', k: '1' }, { t: ElementType.Gunpowder, n: 'Gunpowder', k: 'q' },
  ]},
  { label: 'Liquid', accent: '#4A90D9', elements: [
    { t: ElementType.Water, n: 'Water', k: '2' }, { t: ElementType.Oil, n: 'Oil', k: '6' },
    { t: ElementType.Acid, n: 'Acid', k: '0' }, { t: ElementType.Lava, n: 'Lava', k: '7' },
  ]},
  { label: 'Gas', accent: '#FF6B35', elements: [
    { t: ElementType.Fire, n: 'Fire', k: '5' }, { t: ElementType.Smoke, n: 'Smoke', k: 'e' },
    { t: ElementType.Spark, n: 'Spark', k: 'r' },
  ]},
  { label: 'Solid', accent: '#808080', elements: [
    { t: ElementType.Stone, n: 'Stone', k: '3' }, { t: ElementType.Wall, n: 'Wall', k: '4' },
    { t: ElementType.Wood, n: 'Wood', k: '8' }, { t: ElementType.Plant, n: 'Plant', k: '9' },
    { t: ElementType.Ice, n: 'Ice', k: 'w' }, { t: ElementType.Clone, n: 'Clone', k: 't' },
  ]},
  { label: 'Tool', accent: '#FF4444', elements: [
    { t: ElementType.Erase, n: 'Erase', k: 'x' },
  ]},
]

const COLORS: Record<number, string> = {
  [ElementType.Sand]: '#D4A574', [ElementType.Water]: '#4A90D9', [ElementType.Stone]: '#808080',
  [ElementType.Wall]: '#555555', [ElementType.Fire]: '#FF4500', [ElementType.Oil]: '#8B6914',
  [ElementType.Lava]: '#FF2200', [ElementType.Wood]: '#8B6914', [ElementType.Plant]: '#228B22',
  [ElementType.Acid]: '#7FFF00', [ElementType.Gunpowder]: '#444444', [ElementType.Ice]: '#ADD8E6',
  [ElementType.Smoke]: '#696969', [ElementType.Spark]: '#FFD700', [ElementType.Clone]: '#9370DB',
  [ElementType.Erase]: '#FF4444',
}

const ctrlStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)', color: '#fff',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4,
  cursor: 'pointer', fontSize: 13, minWidth: 32, height: 30,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

export default function Toolbar({ selectedElement, brushSize, bgColor, onSelectElement, onBrushSizeChange, onClear, onTogglePause, onBgColorChange, paused }: ToolbarProps) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '8px 12px', zIndex: 10,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: 900, margin: '0 auto' }}>
        {CATEGORIES.map((cat) => (
          <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: cat.accent, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', width: 48, flexShrink: 0, opacity: 0.8 }}>
              {cat.label}
            </span>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {cat.elements.map(({ t, n, k }) => {
                const sel = selectedElement === t
                const c = COLORS[t]
                return (
                  <button key={t} onClick={() => onSelectElement(t)} title={`${n} (${k})`} style={{
                    background: sel ? c : 'rgba(255,255,255,0.06)', color: sel ? '#fff' : 'rgba(255,255,255,0.7)',
                    border: sel ? `2px solid ${c}` : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 6, cursor: 'pointer', width: 52, height: 44,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                    boxShadow: sel ? `0 0 12px ${c}44, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: sel ? `0 0 6px ${c}` : 'none' }} />
                    <div style={{ fontSize: 9, fontWeight: 600, lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 8, opacity: 0.5, lineHeight: 1 }}>[{k}]</div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>BG</span>
            {BG_PRESETS.map(({ label, color }) => {
              const sel = bgColor[0] === color[0] && bgColor[1] === color[1] && bgColor[2] === color[2]
              return (
                <button key={label} onClick={() => onBgColorChange(color)} title={label} style={{
                  width: 16, height: 16, borderRadius: '50%', padding: 0,
                  background: `rgb(${color[0]},${color[1]},${color[2]})`,
                  border: sel ? '2px solid #fff' : '1px solid rgba(255,255,255,0.25)',
                  cursor: 'pointer', outline: 'none',
                }} />
              )
            })}
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Brush</span>
            <button onClick={() => onBrushSizeChange(Math.max(1, brushSize - 1))} style={ctrlStyle}>−</button>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, width: 20, textAlign: 'center' as const }}>{brushSize}</span>
            <button onClick={() => onBrushSizeChange(Math.min(15, brushSize + 1))} style={ctrlStyle}>+</button>
          </div>
          <button onClick={onClear} style={{ ...ctrlStyle, background: 'rgba(255,68,68,0.2)', color: '#ff6666', border: '1px solid rgba(255,68,68,0.3)', padding: '6px 14px', fontWeight: 700 }}>Clear</button>
          <button onClick={onTogglePause} style={{ ...ctrlStyle, background: paused ? 'rgba(68,255,68,0.15)' : 'rgba(255,170,0,0.15)', color: paused ? '#44ff44' : '#ffaa00', border: paused ? '1px solid rgba(68,255,68,0.3)' : '1px solid rgba(255,170,0,0.3)', padding: '6px 14px', fontWeight: 700 }}>
            {paused ? '▶ Play' : '⏸ Pause'}
          </button>
        </div>
      </div>
    </div>
  )
}
