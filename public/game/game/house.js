// INTERAÇÕES DENTRO DE CASA: quarto, janelas, espelho, armário,
// quadro, cofre e construção.
import { state } from "../core/state.js";
import { $ } from "../core/utils.js";
import { showDialogue } from "../ui/dialogue.js";
import { withObjective } from "../ui/objectives.js";
import { addItem } from "../ui/inventory.js";
import { loadScene, refreshSceneUI } from "./scene-loader.js";

// JANELAS

export function examineWindow() {
    loadScene("ww", () => {
        showDialogue([
            "Parece que estou sendo vigiado...",
            "Preciso fazer algo para que possa tirar a venda sem ser pego.",
            "Talvez algum item que coletei possa ser útil."
        ], withObjective("tapar-janelas", "Encontre uma forma de tapar as janelas", refreshSceneUI), "MEE");
    });
}

export function coverWindows() {
    if (!state.toolsExamined || !state.hasHammer || !state.hasNails) {
        showDialogue(
            ["Ainda não tenho como tapar as janelas, talvez deva procurar uma ferramenta que possa me ajudar."],
            refreshSceneUI,
            "MEE"
        );
        return;
    }

    state.windowsCovered = true;

    loadScene("quarto", () => {
        showDialogue(
            ["Ótimo. Agora que as janelas estão cobertas posso retirar a venda."],
            withObjective("investigar-quarto", "Investigue o quarto sem a venda", refreshSceneUI),
            "MEE"
        );
    });
}

// ESPELHO E ARMÁRIO

export function collectKey() {
    if (state.blindfoldOn) {
        showDialogue(["Esse... Sou eu ?"], refreshSceneUI, "MEE");
        return;
    }
    if (state.keyCollected) return;

    state.keyCollected = true;
    $("mirror-key-overlay").classList.add("hidden");
    addItem("chave do armário");
    showDialogue(["A chave foi adicionada ao inventário."], refreshSceneUI, "MEE SYSTEM");
}

function blindfoldedCabinetMessage() {
    if (state.documentFound) return "Parece que já examinei essa gaveta";
    if (state.keyCollected) return "Com a venda não consigo encaixar a chave na fechadura.";
    return "Hmmm... Parece que está trancado.";
}

export function examineCabinet() {
    if (state.blindfoldOn) {
        showDialogue([blindfoldedCabinetMessage()], refreshSceneUI, "MEE");
        return;
    }

    if (state.documentFound) {
        showDialogue(["Parece que já examinei essa gaveta"], refreshSceneUI, "MEE");
        return;
    }

    if (!state.cabinetUnlocked && !state.keyCollected) {
        showDialogue(["O armário está trancado. Preciso encontrar uma chave."], refreshSceneUI, "MEE");
        return;
    }

    state.cabinetUnlocked = true;
    state.documentFound = true;
    addItem("identidade");
    showDialogue([
        "A gaveta foi aberta.",
        "Há uma carteira de identidade dentro da gaveta. Talvez eu deva examiná-la no inventário."
    ], withObjective("examinar-documento", "Examine o documento no inventário", refreshSceneUI), "MEE SYSTEM");
}

// QUADRO E COFRE

export function examinePicture() {
    if (state.blindfoldOn) {
        showDialogue(["Me parece normal."], refreshSceneUI, "MEE");
        return;
    }

    loadScene("quadroZoom", () => {
        showDialogue(["Parece que tem algo de estranho nesse quadro..."], refreshSceneUI, "MEE");
    });
}

export function removePicture() {
    state.pictureExamined = true;
    loadScene("cofre", () => {
        showDialogue(
            ["O quadro escondia um cofre embutido na parede."],
            withObjective("senha-cofre", "Descubra a senha do cofre", refreshSceneUI),
            "MEE SYSTEM"
        );
    });
}

// Cofre já aberto mostra direto o interior (evita ficar preso no cofre fechado)
export function goToSafe() {
    loadScene(state.safeOpen ? "cofreAberto" : "cofre");
}

export function unlockSafe() {
    state.safeOpen = true;
    loadScene("cofreAberto", () => {
        showDialogue(["Senha Correta. Me parece que há um livro ai dentro"], refreshSceneUI, "MEE SYSTEM");
    });
}

export function collectBook() {
    if (state.bookCollected) return;

    state.bookCollected = true;
    addItem("livro");
    refreshSceneUI();
    showDialogue(["Livro adicionado ao inventário."], withObjective("ler-livro", "Leia o livro", refreshSceneUI), "MEE SYSTEM");
}

// CONSTRUÇÃO

export function examineMachine() {
    if (state.machineExamined) {
        showDialogue(["Não há mais nada que eu possa retirar da máquina."], refreshSceneUI, "MEE");
        return;
    }

    state.machineExamined = true;
    state.machineZoomActive = true;
    loadScene("construcao", () => showDialogue(
        ["A máquina destruída ainda guarda sinais de energia."],
        () => {
            state.machineZoomActive = false;
            loadScene("construcao");
        },
        "MEE"
    ));
}
