// MECÂNICA DA VENDA E REGRAS DE MORTE
// - Fora de casa (portões, frente da casa) sem a venda: game over.
// - Dentro de casa com janelas descobertas: a remoção é bloqueada com aviso.
// - A construção é área segura.
import { state } from "../core/state.js";
import { getDialogue } from "../data/dialogues.js";
import { OUTSIDE_HOUSE_SCENES, INSIDE_HOUSE_SCENES } from "../data/scenes.js";
import { showDialogue, closeDialogue } from "../ui/dialogue.js";
import { addItem } from "../ui/inventory.js";
import { loadScene, refreshSceneUI, isInteractionBlocked } from "./scene-loader.js";
import { gameOver } from "./flow.js";

// Primeira vez que a venda é colocada (botão "Colocar venda" na praia,
// ou a ação "receiveBlindfold" de um diálogo).
export function equipBlindfold() {
    if (state.hasBlindfold) {
        state.blindfoldOn = true;
        loadScene(state.currentScene);
        return;
    }

    state.hasBlindfold = true;
    state.blindfoldOn = true;
    addItem("venda");
    closeDialogue();

    loadScene("beach", () => {
        showDialogue(["Nossa... onde ele foi parar?"], () => {
            showDialogue([
                "Venda equipada.",
                "Use o botão no canto superior esquerdo para colocar ou retirar a venda.",
                "Quando equipada, as aparências já não são mais as mesmas...",
                "Quando removida, segredos são revelados ...",
                "CUIDADO: Nunca remova a venda perto de humanos!"
            ], refreshSceneUI, "MEE SYSTEM");
        }, "MEE");
    });
}

export function toggleBlindfold() {
    if (isInteractionBlocked()) return;

    if (!state.hasBlindfold) {
        equipBlindfold();
        return;
    }

    if (state.blindfoldOn) {
        if (OUTSIDE_HOUSE_SCENES.includes(state.currentScene)) {
            gameOver();
            return;
        }

        if (INSIDE_HOUSE_SCENES.includes(state.currentScene) && !state.windowsCovered) {
            const warning = getDialogue("windowWatchWarning");
            showDialogue(warning.lines, refreshSceneUI, warning.speaker);
            return;
        }
    }

    state.blindfoldOn = !state.blindfoldOn;
    loadScene(state.currentScene);
}

// Sair de casa sem a venda = morte
export function leaveHouse(sceneName, onLoaded = null) {
    if (!state.blindfoldOn) {
        gameOver();
        return;
    }
    loadScene(sceneName, onLoaded);
}

// Ações que podem ser disparadas por data/dialogues.json
export const dialogueActions = Object.freeze({
    receiveBlindfold: equipBlindfold
});
