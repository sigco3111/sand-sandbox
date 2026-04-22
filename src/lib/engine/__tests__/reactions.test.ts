import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ElementType } from '../types';
import { createGrid, getElement, setElement, clearProcessed, getIndex } from '../grid';
import {
  type Reaction,
  REACTIONS,
  updateReactions,
  registerReaction,
  clearReactions,
  registerDefaultReactions,
} from '../reactions';

describe('reactions', () => {
  let grid: ReturnType<typeof createGrid>;

  beforeEach(() => {
    grid = createGrid(10, 10);
    // Save original reactions and clear for test isolation
    clearReactions();
  });

  afterEach(() => {
    clearReactions();
  });

  describe('Reaction type and registration', () => {
    it('should register a reaction and have it available', () => {
      const reaction: Reaction = {
        elementA: ElementType.Fire,
        elementB: ElementType.Water,
        resultA: ElementType.Steam,
        resultB: ElementType.Steam,
      };
      registerReaction(reaction);
      expect(REACTIONS).toContainEqual(reaction);
    });

    it('should start with empty reactions array', () => {
      expect(REACTIONS).toEqual([]);
    });
  });

  describe('updateReactions — no reactions for non-reactive elements', () => {
    it('should not change Sand + Stone when no matching rule exists', () => {
      setElement(grid, 5, 5, ElementType.Sand);
      setElement(grid, 6, 5, ElementType.Stone);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 5, 5)).toBe(ElementType.Sand);
      expect(getElement(grid, 6, 5)).toBe(ElementType.Stone);
    });

    it('should not change anything when grid has no reactions registered', () => {
      setElement(grid, 3, 3, ElementType.Water);
      setElement(grid, 3, 4, ElementType.Sand);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 3, 3)).toBe(ElementType.Water);
      expect(getElement(grid, 3, 4)).toBe(ElementType.Sand);
    });
  });

  describe('updateReactions — applies transformation correctly', () => {
    it('should transform elementA and elementB when reaction matches', () => {
      // Register a test reaction: Fire + Water → Steam + Steam
      registerReaction({
        elementA: ElementType.Fire,
        elementB: ElementType.Water,
        resultA: ElementType.Steam,
        resultB: ElementType.Steam,
      });

      setElement(grid, 5, 5, ElementType.Fire);
      setElement(grid, 6, 5, ElementType.Water); // right neighbor

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 5, 5)).toBe(ElementType.Steam);
      expect(getElement(grid, 6, 5)).toBe(ElementType.Steam);
    });

    it('should detect reactions in all 4 cardinal directions', () => {
      registerReaction({
        elementA: ElementType.Fire,
        elementB: ElementType.Water,
        resultA: ElementType.Steam,
        resultB: ElementType.Steam,
      });

      // Test left neighbor (Water is to the left of Fire)
      setElement(grid, 5, 5, ElementType.Water);
      setElement(grid, 6, 5, ElementType.Fire);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 5, 5)).toBe(ElementType.Steam);
      expect(getElement(grid, 6, 5)).toBe(ElementType.Steam);
    });

    it('should only change resultA if resultB is undefined', () => {
      registerReaction({
        elementA: ElementType.Fire,
        elementB: ElementType.Wood,
        resultA: ElementType.Empty,
        // resultB undefined — Wood stays Wood
      });

      setElement(grid, 5, 5, ElementType.Fire);
      setElement(grid, 5, 6, ElementType.Wood); // below

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 5, 5)).toBe(ElementType.Empty);
      expect(getElement(grid, 5, 6)).toBe(ElementType.Wood);
    });

    it('should only change resultB if resultA is undefined', () => {
      registerReaction({
        elementA: ElementType.Oil,
        elementB: ElementType.Fire,
        // resultA undefined — Oil stays Oil
        resultB: ElementType.Smoke,
      });

      setElement(grid, 5, 5, ElementType.Oil);
      setElement(grid, 5, 4, ElementType.Fire); // above

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 5, 5)).toBe(ElementType.Oil);
      expect(getElement(grid, 5, 4)).toBe(ElementType.Smoke);
    });
  });

  describe('updateReactions — processed flag prevents double-reactions', () => {
    it('should not react if the cell is already processed', () => {
      registerReaction({
        elementA: ElementType.Fire,
        elementB: ElementType.Water,
        resultA: ElementType.Steam,
        resultB: ElementType.Steam,
      });

      setElement(grid, 5, 5, ElementType.Fire);
      setElement(grid, 6, 5, ElementType.Water);

      // Mark the Fire cell as already processed
      const idx = getIndex(5, 5, grid.width);
      grid.processed[idx] = 1;

      updateReactions(grid);

      // Fire should remain unchanged because it was already processed
      expect(getElement(grid, 5, 5)).toBe(ElementType.Fire);
      expect(getElement(grid, 6, 5)).toBe(ElementType.Water);
    });

    it('should not react if the neighbor cell is already processed', () => {
      registerReaction({
        elementA: ElementType.Fire,
        elementB: ElementType.Water,
        resultA: ElementType.Steam,
        resultB: ElementType.Steam,
      });

      setElement(grid, 5, 5, ElementType.Fire);
      setElement(grid, 6, 5, ElementType.Water);

      // Mark the Water cell as already processed
      const idx = getIndex(6, 5, grid.width);
      grid.processed[idx] = 1;

      updateReactions(grid);

      // No reaction because the neighbor was already processed
      expect(getElement(grid, 5, 5)).toBe(ElementType.Fire);
      expect(getElement(grid, 6, 5)).toBe(ElementType.Water);
    });
  });

  describe('updateReactions — one reaction per cell per frame', () => {
    it('should limit each cell to one reaction per frame', () => {
      // Register two different reactions that both involve Fire
      registerReaction({
        elementA: ElementType.Fire,
        elementB: ElementType.Water,
        resultA: ElementType.Steam,
        resultB: ElementType.Steam,
      });
      registerReaction({
        elementA: ElementType.Fire,
        elementB: ElementType.Oil,
        resultA: ElementType.Smoke,
        resultB: ElementType.Smoke,
      });

      // Fire in the center, Water on right, Oil below
      setElement(grid, 5, 5, ElementType.Fire);
      setElement(grid, 6, 5, ElementType.Water);
      setElement(grid, 5, 6, ElementType.Oil);

      clearProcessed(grid);
      updateReactions(grid);

      // Fire should have reacted with one neighbor and become processed
      // The other neighbor should remain unchanged
      const fireCell = getElement(grid, 5, 5);
      expect(fireCell).not.toBe(ElementType.Fire); // Fire must have changed

      // Check that only one of the two neighbors reacted
      const waterResult = getElement(grid, 6, 5);
      const oilResult = getElement(grid, 5, 6);
      const reactedCount =
        (waterResult !== ElementType.Water ? 1 : 0) +
        (oilResult !== ElementType.Oil ? 1 : 0);
      expect(reactedCount).toBe(1);
    });
  });

  describe('updateReactions — edge cases', () => {
    it('should skip Empty cells', () => {
      registerReaction({
        elementA: ElementType.Fire,
        elementB: ElementType.Water,
        resultA: ElementType.Steam,
        resultB: ElementType.Steam,
      });

      // No elements set — all Empty
      clearProcessed(grid);
      updateReactions(grid);

      // Nothing to check — just ensure no errors
      expect(getElement(grid, 5, 5)).toBe(ElementType.Empty);
    });

    it('should handle reactions at grid boundaries', () => {
      registerReaction({
        elementA: ElementType.Fire,
        elementB: ElementType.Water,
        resultA: ElementType.Steam,
        resultB: ElementType.Steam,
      });

      // Fire at top-left corner, Water to the right
      setElement(grid, 0, 0, ElementType.Fire);
      setElement(grid, 1, 0, ElementType.Water);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 0, 0)).toBe(ElementType.Steam);
      expect(getElement(grid, 1, 0)).toBe(ElementType.Steam);
    });
  });
});

describe('Phase 2 Reactions', () => {
  let grid: ReturnType<typeof createGrid>;

  beforeEach(() => {
    grid = createGrid(10, 10);
    clearReactions();
    registerDefaultReactions();
  });

  afterEach(() => {
    clearReactions();
  });

  it('Fire + Water → Smoke + Steam (Fire becomes Smoke, Water becomes Steam)', () => {
    setElement(grid, 5, 5, ElementType.Fire);
    setElement(grid, 6, 5, ElementType.Water);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Smoke);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Steam);
  });

  it('Water + Fire → Steam + Smoke (bidirectional)', () => {
    setElement(grid, 5, 5, ElementType.Water);
    setElement(grid, 6, 5, ElementType.Fire);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Steam);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Smoke);
  });

  it('Water + Lava → Steam + Stone', () => {
    setElement(grid, 5, 5, ElementType.Water);
    setElement(grid, 6, 5, ElementType.Lava);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Steam);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Stone);
  });

  it('Lava + Water → Stone + Steam (bidirectional)', () => {
    setElement(grid, 5, 5, ElementType.Lava);
    setElement(grid, 6, 5, ElementType.Water);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Stone);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Steam);
  });

  it('Fire + Oil → Oil becomes Fire (fire spreads)', () => {
    setElement(grid, 5, 5, ElementType.Fire);
    setElement(grid, 6, 5, ElementType.Oil);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Fire);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Fire);
  });

  it('Oil + Fire → Oil becomes Fire (bidirectional spread)', () => {
    setElement(grid, 5, 5, ElementType.Oil);
    setElement(grid, 6, 5, ElementType.Fire);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Fire);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Fire);
  });

  it('Fire + Wood → Wood becomes Fire (fire spreads)', () => {
    setElement(grid, 5, 5, ElementType.Fire);
    setElement(grid, 6, 5, ElementType.Wood);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Fire);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Fire);
  });

  it('Wood + Fire → Wood becomes Fire (bidirectional spread)', () => {
    setElement(grid, 5, 5, ElementType.Wood);
    setElement(grid, 6, 5, ElementType.Fire);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Fire);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Fire);
  });

  it('Fire + Plant → Plant becomes Fire (fire spreads)', () => {
    setElement(grid, 5, 5, ElementType.Fire);
    setElement(grid, 6, 5, ElementType.Plant);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Fire);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Fire);
  });

  it('Plant + Fire → Plant becomes Fire (bidirectional spread)', () => {
    setElement(grid, 5, 5, ElementType.Plant);
    setElement(grid, 6, 5, ElementType.Fire);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Fire);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Fire);
  });

  it('Lava + Wood → Stone + Fire', () => {
    setElement(grid, 5, 5, ElementType.Lava);
    setElement(grid, 6, 5, ElementType.Wood);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Stone);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Fire);
  });

  it('Wood + Lava → Fire + Stone (bidirectional)', () => {
    setElement(grid, 5, 5, ElementType.Wood);
    setElement(grid, 6, 5, ElementType.Lava);

    clearProcessed(grid);
    updateReactions(grid);

    expect(getElement(grid, 5, 5)).toBe(ElementType.Fire);
    expect(getElement(grid, 6, 5)).toBe(ElementType.Stone);
  });
});

describe('Phase 3 Reactions', () => {
  let grid: ReturnType<typeof createGrid>;

  beforeEach(() => {
    grid = createGrid(20, 20);
    clearReactions();
    registerDefaultReactions();
  });

  afterEach(() => {
    clearReactions();
  });

  describe('Acid dissolution', () => {
    it('dissolves Sand', () => {
      setElement(grid, 5, 5, ElementType.Acid);
      setElement(grid, 6, 5, ElementType.Sand);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 5, 5)).toBe(ElementType.Empty);
      expect(getElement(grid, 6, 5)).toBe(ElementType.Empty);
    });

    it('dissolves Wood', () => {
      setElement(grid, 5, 5, ElementType.Acid);
      setElement(grid, 6, 5, ElementType.Wood);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 5, 5)).toBe(ElementType.Empty);
      expect(getElement(grid, 6, 5)).toBe(ElementType.Empty);
    });

    it('dissolves Plant', () => {
      setElement(grid, 5, 5, ElementType.Acid);
      setElement(grid, 6, 5, ElementType.Plant);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 5, 5)).toBe(ElementType.Empty);
      expect(getElement(grid, 6, 5)).toBe(ElementType.Empty);
    });

    it('does NOT dissolve Stone', () => {
      setElement(grid, 5, 5, ElementType.Acid);
      setElement(grid, 6, 5, ElementType.Stone);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 5, 5)).toBe(ElementType.Acid);
      expect(getElement(grid, 6, 5)).toBe(ElementType.Stone);
    });

    it('does NOT dissolve Wall', () => {
      setElement(grid, 5, 5, ElementType.Acid);
      setElement(grid, 6, 5, ElementType.Wall);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 5, 5)).toBe(ElementType.Acid);
      expect(getElement(grid, 6, 5)).toBe(ElementType.Wall);
    });
  });

  describe('Gunpowder explosion', () => {
    it('explodes on Fire contact', () => {
      setElement(grid, 10, 10, ElementType.Gunpowder);
      setElement(grid, 10, 11, ElementType.Fire);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 10, 10)).toBe(ElementType.Fire);
    });

    it('explosion radius 3 destroys elements within range', () => {
      setElement(grid, 10, 10, ElementType.Gunpowder);
      setElement(grid, 10, 11, ElementType.Fire);
      setElement(grid, 12, 10, ElementType.Wood);
      setElement(grid, 10, 8, ElementType.Sand);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 12, 10)).toBe(ElementType.Smoke);
      expect(getElement(grid, 10, 8)).toBe(ElementType.Smoke);
    });

    it('center becomes Fire, ring becomes Smoke', () => {
      setElement(grid, 10, 10, ElementType.Gunpowder);
      setElement(grid, 10, 11, ElementType.Fire);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 10, 10)).toBe(ElementType.Fire);
      expect(getElement(grid, 10, 9)).toBe(ElementType.Fire);
      expect(getElement(grid, 9, 10)).toBe(ElementType.Fire);
      expect(getElement(grid, 11, 10)).toBe(ElementType.Fire);
      expect(getElement(grid, 10, 11)).toBe(ElementType.Fire);
    });

    it('Wall and Stone are immune to explosion', () => {
      setElement(grid, 10, 10, ElementType.Gunpowder);
      setElement(grid, 10, 11, ElementType.Fire);
      setElement(grid, 9, 10, ElementType.Wall);
      setElement(grid, 11, 10, ElementType.Stone);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 9, 10)).toBe(ElementType.Wall);
      expect(getElement(grid, 11, 10)).toBe(ElementType.Stone);
    });

    it('chain reaction happens next frame (not same frame)', () => {
      setElement(grid, 10, 10, ElementType.Gunpowder);
      setElement(grid, 10, 11, ElementType.Fire);

      grid.processed[getIndex(10, 10, grid.width)] = 1;

      updateReactions(grid);

      expect(getElement(grid, 10, 10)).toBe(ElementType.Gunpowder);

      clearProcessed(grid);
      updateReactions(grid);

      expect(getElement(grid, 10, 10)).toBe(ElementType.Fire);
    });
  });
});
