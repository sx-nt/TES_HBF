// PONTO DE ENTRADA: conecta os módulos e registra os eventos da página.
import { $ } from "./core/utils.js";
import { setupUiSounds } from "./core/audio.js";
import { SAFE_CODE } from "./data/scenes.js";
import { skipTyping } from "./ui/dialogue.js";
import { crtTransition } from "./ui/transitions.js";
import { initObjectives } from "./ui/objectives.js";
import { togglePause, saveGame, updateBlindfoldButton } from "./ui/hud.js";
import { setOpenableItems, toggleInventory } from "./ui/inventory.js";
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
    "documento": { hint: "Abrir", action: openDocumentViewer },
    "livro": { hint: "Ler", action: openBookReader }
});

initReaders({ onBookClosed: handleBookClosed });
initSafePanel({ code: SAFE_CODE, onUnlock: unlockSafe });
initObjectives();
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

// API mínima para a camada HTML e para futuras telas de menu.
window.startBoot = boot;
window.startGame = startGame;
