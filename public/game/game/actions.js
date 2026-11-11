// AÇÕES DE CADA CENÁRIO
// Cada cenário retorna a lista de botões [rótulo, ação] conforme o estado.
import { state } from "../core/state.js";
import { $ } from "../core/utils.js";
import { hasItem } from "../ui/inventory.js";
import { openSafePanel } from "../ui/safe.js";
import { loadScene, isInteractionBlocked } from "./scene-loader.js";
import { examineDebris, collectWood, goToGates, returnToGates, examineTools, collectTools } from "./outside.js";
import {
    examineWindow, coverWindows, collectKey, examineCabinet, examinePicture,
    removePicture, goToSafe, collectBook, examineMachine
} from "./house.js";

const go = (sceneName) => () => loadScene(sceneName);

const SCENE_ACTIONS = {
    beach: (s) => [
        !s.debrisExamined && ["Examinar destroços", examineDebris],
        s.debrisExamined && !hasItem("madeira") && ["Coletar madeira", collectWood],
        s.hasBlindfold && ["Ir para os portões", goToGates]
    ],

    houseFront: (s) => [
        s.toolsExamined && (!s.hasHammer || !s.hasNails) && ["Coletar ferramentas", collectTools],
        ["Entrar na casa", go("quarto")],
        !s.toolsExamined && ["Examinar ferramentas", examineTools]
    ],

    quarto: (s) => [
        ["Examinar quadro", examinePicture],
        ["Examinar espelho", go("mirror")],
        ["Examinar armário", examineCabinet],
        s.windowsCovered && !s.blindfoldOn && s.hasHammer && s.hasNails &&
            ["Ir para a construção", go("construcao")],
        ["Voltar aos portões", returnToGates],
        !s.windowsCovered && ["Examinar janelas", examineWindow]
    ],

    quadroZoom: (s) => [
        !s.pictureExamined && ["Remover o quadro", removePicture],
        s.pictureExamined && ["Acessar cofre", goToSafe],
        ["Voltar ao quarto", go("quarto")]
    ],

    cofre: (s) => [
        ["Voltar", go("quadroZoom")],
        !s.safeOpen && ["Inserir senha", openSafePanel]
    ],

    cofreAberto: (s) => [
        !s.bookCollected && ["Pegar o livro", collectBook],
        ["Voltar ao quarto", go("quarto")]
    ],

    ww: (s) => [
        !s.windowsCovered && ["Tapar as janelas", coverWindows],
        ["Voltar ao quarto", go("quarto")]
    ],

    mirror: (s) => [
        !s.keyCollected && !s.blindfoldOn && ["Coletar chave", collectKey],
        ["Voltar ao quarto", go("quarto")]
    ],

    construcao: (s) => [
        [s.machineExamined ? "Interagir com a máquina" : "Examinar máquina destruída", examineMachine],
        ["Voltar ao quarto", go("quarto")]
    ]
};

function createActionButton(label, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;

    // Ignora cliques durante transição, diálogo, pausa ou game over
    button.addEventListener("click", () => {
        if (isInteractionBlocked()) return;
        action();
    });

    return button;
}

export function updateSceneActions() {
    const container = $("scene-actions");
    const getActions = SCENE_ACTIONS[state.currentScene];
    const actions = getActions ? getActions(state).filter(Boolean) : [];

    container.replaceChildren(...actions.map(([label, action]) => createActionButton(label, action)));
}
