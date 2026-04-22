'use client'

import { useEffect } from 'react'
import { ElementType } from '@/lib/engine/types'

const KEY_ELEMENT_MAP: Record<string, ElementType> = {
  '1': ElementType.Sand,
  '2': ElementType.Water,
  '3': ElementType.Stone,
  '4': ElementType.Wall,
  '5': ElementType.Fire,
  '6': ElementType.Oil,
  '7': ElementType.Lava,
  '8': ElementType.Wood,
  '9': ElementType.Plant,
  '0': ElementType.Acid,
  'q': ElementType.Gunpowder,
  'w': ElementType.Ice,
  'e': ElementType.Smoke,
  'r': ElementType.Spark,
  't': ElementType.Clone,
  'x': ElementType.Erase,
}

interface UseKeyboardOptions {
  onSelectElement: (element: ElementType) => void
  onTogglePause: () => void
  onClear: () => void
  onSpeedChange: (delta: number) => void
}

export function useKeyboard({ onSelectElement, onTogglePause, onClear, onSpeedChange }: UseKeyboardOptions): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (KEY_ELEMENT_MAP[e.key] !== undefined) {
        onSelectElement(KEY_ELEMENT_MAP[e.key])
        return
      }
      switch (e.key) {
        case ' ':
          e.preventDefault()
          onTogglePause()
          break
        case 'c':
        case 'C':
          onClear()
          break
        case '[':
          onSpeedChange(-0.5)
          break
        case ']':
          onSpeedChange(0.5)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSelectElement, onTogglePause, onClear, onSpeedChange])
}
