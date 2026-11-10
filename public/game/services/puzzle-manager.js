/** Orquestrador de puzzles: regras não devem ficar misturadas com a UI. */
export function createPuzzleManager() {
  const puzzles = new Map()
  return {
    register(id, puzzle) { puzzles.set(id, puzzle) },
    canStart(id, state) { return puzzles.get(id)?.canStart?.(state) ?? false },
    solve(id, input, state) { return puzzles.get(id)?.solve?.(input, state) ?? false },
  }
}
