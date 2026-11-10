// TRANSIÇÃO CRT
import { playTransitionSound } from "../core/audio.js";
import { $ } from "../core/utils.js";

const COVER_MS = 180;
const TOTAL_MS = 650;

let coverTimer = null;
let revealTimer = null;
let pendingCallback = null;

// Cobre a tela, executa o callback com a tela escura e revela de novo.
// Uma transição nova antes da anterior cobrir executa o callback pendente
// imediatamente, para nenhum callback se perder.
export function crtTransition(callback) {
    const transition = $("crt-transition");

    if (pendingCallback) runPending();
    clearTimeout(revealTimer);

    transition.classList.remove("cover", "reveal");
    void transition.offsetWidth;

    playTransitionSound();
    transition.classList.add("cover");

    pendingCallback = callback;
    coverTimer = setTimeout(() => {
        transition.classList.remove("cover");
        transition.classList.add("reveal");
        runPending();
    }, COVER_MS);

    revealTimer = setTimeout(() => {
        transition.classList.remove("reveal");
    }, TOTAL_MS);
}

function runPending() {
    clearTimeout(coverTimer);
    coverTimer = null;

    const callback = pendingCallback;
    pendingCallback = null;
    callback?.();
}
