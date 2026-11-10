/** Registro de conteúdo: cenários e hotspots ficam separados da renderização. */
export const sceneRegistry = Object.freeze({
  beach: { hasHuman: false, imageKey: 'beach' },
  gates: { hasHuman: true, imageKey: 'gates' },
  quarto: { hasHuman: false, imageKey: 'quarto' },
  mirror: { hasHuman: false, imageKey: 'mirror' },
  construcao: { hasHuman: false, imageKey: 'construcao' },
  ww: { hasHuman: false, imageKey: 'ww' },
})

export function isKnownScene(sceneName) {
  return Object.hasOwn(sceneRegistry, sceneName)
}
