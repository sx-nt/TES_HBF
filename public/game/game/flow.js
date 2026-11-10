// FLUXO DA PARTIDA: iniciar, reiniciar, game over e fim do capítulo.
import { state, resetState } from "../core/state.js";
import { $ } from "../core/utils.js";
import { stopBootSound, playBackgroundMusic, pauseBackgroundMusic } from "../core/audio.js";
import { closeDialogue } from "../ui/dialogue.js";
import { resetObjectives, completeObjective, closeObjectives } from "../ui/objectives.js";
import { showHud, hideHud, closePause, updateBattery, updateBlindfoldButton } from "../ui/hud.js";
import { updateInventory, closeInventory } from "../ui/inventory.js";
import { closeReadingModals } from "../ui/readers.js";
import { closeSafePanel } from "../ui/safe.js";
import { showFeiraReward, resetFeira } from "../ui/feira.js";
import { loadScene, cancelSceneLoad } from "./scene-loader.js";
import { startBoot } from "./boot.js";

// Fecha painéis, modais e diálogos e cancela carregamentos pendentes.
function interruptGameplay() {
    cancelSceneLoad();
    closeDialogue();
    closeInventory();
    closeObjectives();
    closePause();
    closeSafePanel();
    closeReadingModals();
}

function hideScreens(...ids) {
    ids.forEach(id => $(id).classList.add("hidden"));
}

// INICIAR JOGO
export function startGame() {
    interruptGameplay();
    stopBootSound();

    resetState();
    resetObjectives();
    resetFeira();

    hideScreens("start-screen", "boot-screen", "game-over", "chapter-end", "scene", "interface");
    $("game").classList.remove("blindfold-active");

    updateInventory();
    updateBattery();
    updateBlindfoldButton();
    showHud();

    playBackgroundMusic();
    loadScene("beach");
}

// REINICIAR (volta para a tela de boot)
export function restartGame() {
    interruptGameplay();
    hideHud();
    pauseBackgroundMusic();
    startBoot(startGame);
}

// GAME OVER
// Bloqueia toda a interação até o jogador reiniciar.
export function gameOver() {
    if (state.isGameOver) return;

    interruptGameplay();
    state.isGameOver = true;

    hideHud();
    hideScreens("interface");
    pauseBackgroundMusic();

    $("game-over").classList.remove("hidden");
    $("restart-button").focus();
}

// FIM DO CAPÍTULO
// Ler o livro inteiro pela primeira vez encerra o capítulo.
export function handleBookClosed(reachedEnd) {
    if (!reachedEnd || state.bookRead || state.isGameOver) return;

    state.bookRead = true;
    showChapterEnd();
}

function showChapterEnd() {
    interruptGameplay();
    completeObjective("ler-livro");

    hideHud();
    hideScreens("interface");

    $("chapter-end").classList.remove("hidden");
    showFeiraReward();
    $("chapter-end-restart").focus();
}
