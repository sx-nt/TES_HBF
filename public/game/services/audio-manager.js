/** Porta para efeitos sonoros. Mantém áudio opcional até os arquivos serem definidos. */
export function createAudioManager({ enabled = false } = {}) {
  const sounds = new Map()
  return {
    register(name, source) { sounds.set(name, new Audio(source)) },
    play(name) { if (enabled) sounds.get(name)?.play().catch(() => {}) },
    setEnabled(value) { enabled = value },
  }
}
