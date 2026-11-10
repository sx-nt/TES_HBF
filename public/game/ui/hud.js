// HUD: barra superior (bateria, pausa, salvar) e botão da venda.
import { state, getProgressSnapshot } from "../core/state.js";
import { playBackgroundMusic, pauseBackgroundMusic } from "../core/audio.js";
import { $ } from "../core/utils.js";
import { getObjectives } from "./objectives.js";

const SAVE_KEY = "mee-save";
const LOW_BATTERY = 20;

export function showHud() {
    $("top-hud").classList.remove("hidden");
}

export function hideHud() {
    $("top-hud").classList.add("hidden");
}

// BATERIA

export function updateBattery() {
    const level = $("battery-level");
    const value = $("battery-value");
    if (!level || !value) return;

    level.style.width = `${state.battery}%`;
    level.classList.toggle("battery-low", state.battery <= LOW_BATTERY);
    value.textContent = `${state.battery}%`;
}

// BOTÃO DA VENDA
// Aparece quando o jogador já tem a venda ou pode equipá-la
// (destroços examinados e madeira coletada).

export function updateBlindfoldButton() {
    const button = $("blindfold-button");
    if (!button) return;

    const available = state.hasBlindfold ||
        (state.debrisExamined && state.inventory.includes("madeira"));
    const label = state.blindfoldOn ? "Retirar venda" : "Colocar venda";

    button.classList.toggle("hidden", !available);
    button.textContent = label;
    button.setAttribute("aria-label", label);
}

// PAUSA

function applyPause(paused) {
    state.isPaused = paused;
    $("pause-menu").classList.toggle("hidden", !paused);
    $("pause-button").setAttribute("aria-expanded", String(paused));
    $("game").classList.toggle("paused", paused);
}

export function togglePause() {
    if (state.isGameOver) return;

    applyPause(!state.isPaused);
    $("save-feedback").textContent = "";

    if (state.isPaused) {
        pauseBackgroundMusic();
    } else {
        playBackgroundMusic();
    }
}

// Fecha o menu de pausa sem mexer na música (usado ao reiniciar/game over)
export function closePause() {
    applyPause(false);
}

// SALVAR

export function saveGame() {
    const feedback = $("save-feedback");
    const saveState = { ...getProgressSnapshot(), objectives: getObjectives() };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
        feedback.textContent = "Jogo salvo neste navegador.";
    } catch (error) {
        console.warn("Não foi possível salvar o jogo:", error);
        feedback.textContent = "Não foi possível salvar neste navegador.";
    }
}
