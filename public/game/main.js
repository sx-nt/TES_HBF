// PONTO DE ENTRADA: conecta os módulos e registra os eventos da página.
import { $ } from "./core/utils.js";
import { setupUiSounds, playUiSound } from "./core/audio.js";
import { state } from "./core/state.js";
import { SAFE_CODE } from "./data/scenes.js";
import { skipTyping } from "./ui/dialogue.js";
import { crtTransition } from "./ui/transitions.js";
import { initObjectives, closeObjectives } from "./ui/objectives.js";
import { initNotifications } from "./ui/notifications.js";
import { togglePause, saveGame, updateBlindfoldButton } from "./ui/hud.js";
import { setOpenableItems, toggleInventory, closeInventory } from "./ui/inventory.js";
import { initReaders, openDocumentViewer, openBookReader } from "./ui/readers.js";
import { initSafePanel } from "./ui/safe.js";
import { setSceneUIRenderer } from "./game/scene-loader.js";
import { updateSceneActions } from "./game/actions.js";
import { toggleBlindfold } from "./game/blindfold.js";
import { unlockSafe } from "./game/house.js";
import { startBoot, skipBoot } from "./game/boot.js";
import { startGame, restartGame, handleBookClosed } from "./game/flow.js";

const boot = () => startBoot(startGame);

// LIGAÇÕES ENTRE MÓDULOS

setSceneUIRenderer(() => {
    updateBlindfoldButton();
    updateSceneActions();
});

setOpenableItems({
    "identidade": { hint: "Abrir", action: openDocumentViewer },
    "livro": { hint: "Ler", action: openBookReader }
});

initReaders({ onBookClosed: handleBookClosed });
initSafePanel({ code: SAFE_CODE, onUnlock: unlockSafe });
initObjectives();
initNotifications();
setupUiSounds();
updateBlindfoldButton();

// EVENTOS

const clicks = {
    "start-button": () => crtTransition(boot),
    "restart-button": restartGame,
    "chapter-end-restart": restartGame,
    "blindfold-button": toggleBlindfold,
    "inventory-toggle": toggleInventory,
    "inventory-close": toggleInventory,
    "save-button": saveGame,
    "pause-button": togglePause,
    "resume-button": togglePause,
    "pause-restart-button": restartGame
};

Object.entries(clicks).forEach(([id, handler]) => {
    $(id).addEventListener("click", handler);
});

// Espaço: completa o texto em digitação ou pula o boot
document.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    if (event.target.closest?.("input, textarea")) return;

    event.preventDefault();
    if (skipTyping()) return;
    skipBoot();
});

// Esc: fecha uma camada por vez, da mais alta para a mais baixa.
// Leitores (documento/livro) e o painel do cofre tratam o próprio Esc;
// aqui ficam a pausa e, abaixo dela, o inventário e os objetivos.
const SELF_CLOSING_LAYERS = ["document-viewer", "book-reader", "safe-panel"];

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (SELF_CLOSING_LAYERS.some(id => !$(id).classList.contains("hidden"))) return;

    if (state.isPaused) {
        event.preventDefault();
        togglePause();
        return;
    }

    if (closeInventory() || closeObjectives()) {
        event.preventDefault();
        playUiSound("popupClose");
    }
}, true); // captura: decide antes dos handlers que fecham os leitores e o cofre

// API mínima para a camada HTML e para futuras telas de menu.
window.startBoot = boot;
window.startGame = startGame;
