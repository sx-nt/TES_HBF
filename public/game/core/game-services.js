import { createGameState } from './game-state.js'
import { sceneRegistry } from './scene-registry.js'
import { createAudioManager } from '../services/audio-manager.js'
import { createPuzzleManager } from '../services/puzzle-manager.js'
import { createScreenEffects } from '../services/screen-effects.js'

export const gameServices = {
  state: createGameState(),
  scenes: sceneRegistry,
  audio: createAudioManager(),
  puzzles: createPuzzleManager(),
  effects: createScreenEffects(),
}

window.GameServices = gameServices
