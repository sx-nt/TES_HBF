/** Estado centralizado: futuras features não precisam depender do DOM. */
export function createGameState() {
  return {
    scene: null,
    blindfold: { available: false, active: false },
    progress: { computerExamined: false },
    flags: new Set(),
  }
}
