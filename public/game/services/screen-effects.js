/** Efeitos visuais isolados da lógica de jogo para permitir novos efeitos depois. */
export function createScreenEffects(documentRef = document) {
  return {
    crt(callback) {
      const transition = documentRef.getElementById('crt-transition')
      transition.classList.remove('cover', 'reveal')
      void transition.offsetWidth
      transition.classList.add('cover')
      window.setTimeout(() => { callback(); transition.classList.remove('cover'); transition.classList.add('reveal') }, 180)
      window.setTimeout(() => transition.classList.remove('reveal'), 650)
    },
    flash(className = 'screen-flash') {
      documentRef.getElementById('game')?.classList.add(className)
      window.setTimeout(() => documentRef.getElementById('game')?.classList.remove(className), 250)
    },
  }
}
