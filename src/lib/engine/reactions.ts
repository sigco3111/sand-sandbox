import { ElementType } from './types';
import { type Grid, getElement, setElement, getIndex, inBounds } from './grid';

export type Reaction = {
  elementA: number;
  elementB: number;
  resultA?: number;
  resultB?: number;
};

const DIRECTIONS = [
  [0, -1], // up
  [0, 1],  // down
  [-1, 0], // left
  [1, 0],  // right
] as const;

export let REACTIONS: Reaction[] = [];

export function registerReaction(reaction: Reaction): void {
  REACTIONS.push(reaction);
}

export function clearReactions(): void {
  REACTIONS = [];
}

export function registerDefaultReactions(): void {
  REACTIONS = [];

  // Water + Fire → Steam (Water → Steam, Fire → Smoke) — both directions
  registerReaction({ elementA: ElementType.Fire, elementB: ElementType.Water, resultA: ElementType.Smoke, resultB: ElementType.Steam });
  registerReaction({ elementA: ElementType.Water, elementB: ElementType.Fire, resultA: ElementType.Steam, resultB: ElementType.Smoke });

  // Water + Lava → Stone + Steam (Water → Steam, Lava → Stone) — both directions
  registerReaction({ elementA: ElementType.Water, elementB: ElementType.Lava, resultA: ElementType.Steam, resultB: ElementType.Stone });
  registerReaction({ elementA: ElementType.Lava, elementB: ElementType.Water, resultA: ElementType.Stone, resultB: ElementType.Steam });

  // Fire + Oil → Fire spreads (Oil → Fire, Fire stays) — both directions
  registerReaction({ elementA: ElementType.Fire, elementB: ElementType.Oil, resultA: undefined, resultB: ElementType.Fire });
  registerReaction({ elementA: ElementType.Oil, elementB: ElementType.Fire, resultA: ElementType.Fire, resultB: undefined });

  // Fire + Wood → Fire spreads (Wood → Fire, Fire stays) — both directions
  registerReaction({ elementA: ElementType.Fire, elementB: ElementType.Wood, resultA: undefined, resultB: ElementType.Fire });
  registerReaction({ elementA: ElementType.Wood, elementB: ElementType.Fire, resultA: ElementType.Fire, resultB: undefined });

  // Fire + Plant → Fire spreads (Plant → Fire, Fire stays) — both directions
  registerReaction({ elementA: ElementType.Fire, elementB: ElementType.Plant, resultA: undefined, resultB: ElementType.Fire });
  registerReaction({ elementA: ElementType.Plant, elementB: ElementType.Fire, resultA: ElementType.Fire, resultB: undefined });

  // Lava + Wood → Stone + Fire (Lava → Stone, Wood → Fire) — both directions
  registerReaction({ elementA: ElementType.Lava, elementB: ElementType.Wood, resultA: ElementType.Stone, resultB: ElementType.Fire });
  registerReaction({ elementA: ElementType.Wood, elementB: ElementType.Lava, resultA: ElementType.Fire, resultB: ElementType.Stone });

  // Acid dissolves everything except Stone, Wall, and Empty
  const acidTargets = [
    ElementType.Sand, ElementType.Water, ElementType.Oil, ElementType.Wood,
    ElementType.Plant, ElementType.Gunpowder, ElementType.Ice, ElementType.Fire,
    ElementType.Steam, ElementType.Smoke, ElementType.Spark, ElementType.Lava, ElementType.Acid,
  ];
  for (const target of acidTargets) {
    registerReaction({ elementA: ElementType.Acid, elementB: target, resultA: ElementType.Empty, resultB: ElementType.Empty });
    registerReaction({ elementA: target, elementB: ElementType.Acid, resultA: ElementType.Empty, resultB: ElementType.Empty });
  }
}

registerDefaultReactions();

function explode(grid: Grid, cx: number, cy: number, radius: number): void {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > radius * radius) continue
      const nx = cx + dx
      const ny = cy + dy
      if (!inBounds(nx, ny, grid.width, grid.height)) continue
      const idx = getIndex(nx, ny, grid.width)
      const type = grid.elements[idx] as ElementType
      if (type === ElementType.Wall || type === ElementType.Stone) continue
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= 1) {
        grid.elements[idx] = ElementType.Fire
      } else if (dist <= radius) {
        grid.elements[idx] = ElementType.Smoke
      }
      grid.processed[idx] = 1
    }
  }
}

export function updateReactions(grid: Grid): void {
  const { width, height, processed } = grid;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIndex(x, y, width);
      const element = grid.elements[idx];

      if (element === ElementType.Empty || processed[idx]) continue;

      for (const [dx, dy] of DIRECTIONS) {
        const nx = x + dx;
        const ny = y + dy;

        if (!inBounds(nx, ny, width, height)) continue;

        const nIdx = getIndex(nx, ny, width);
        if (processed[nIdx]) continue;

        const neighbor = grid.elements[nIdx];
        if (neighbor === ElementType.Empty) continue;

        for (const reaction of REACTIONS) {
          if (reaction.elementA === element && reaction.elementB === neighbor) {
            if (reaction.resultA !== undefined) {
              setElement(grid, x, y, reaction.resultA);
            }
            if (reaction.resultB !== undefined) {
              setElement(grid, nx, ny, reaction.resultB);
            }
            processed[idx] = 1;
            processed[nIdx] = 1;
            break;
          }
        }

        if (processed[idx]) break;
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIndex(x, y, width);
      if (processed[idx]) continue;
      const element = grid.elements[idx] as ElementType;
      if (element !== ElementType.Gunpowder) continue;

      for (const [dx, dy] of DIRECTIONS) {
        const nx = x + dx;
        const ny = y + dy;
        if (!inBounds(nx, ny, width, height)) continue;
        const neighbor = grid.elements[getIndex(nx, ny, width)] as ElementType;
        if (neighbor === ElementType.Fire || neighbor === ElementType.Spark) {
          explode(grid, x, y, 3);
          break;
        }
      }
    }
  }
}
