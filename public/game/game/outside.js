// INTERAÇÕES FORA DE CASA: praia, portões e frente da casa.
import { state } from "../core/state.js";
import { getDialogue } from "../data/dialogues.js";
import { GATES_OFFICER_IMAGE } from "../data/scenes.js";
import { showDialogue, showChoiceDialogue, playDialogueSteps, setVoiceOverride } from "../ui/dialogue.js";
import { setObjective, completeObjective, withObjective } from "../ui/objectives.js";
import { addItem, hasItem } from "../ui/inventory.js";
import { updateBattery } from "../ui/hud.js";
import { loadScene, refreshSceneUI, swapBackground } from "./scene-loader.js";
import { leaveHouse, dialogueActions } from "./blindfold.js";
import { startInterrogation, eliminatePlayer } from "./interrogation.js";

const WOOD_BATTERY_COST = 5;

// PRAIA

export function examineDebris() {
    if (state.debrisExamined) return;

    state.machineZoomActive = true;

    loadScene("beach", async () => {
        setVoiceOverride("machine");
        await playDialogueSteps(getDialogue("computerIntro").steps, dialogueActions);
        setVoiceOverride(null);

        state.debrisExamined = true;
        state.machineZoomActive = false;

        // Pedido da máquina destruída
        loadScene("beach", withObjective("madeira", "Colete madeira nos destroços antes de seguir", refreshSceneUI));
    });
}

export function collectWood() {
    if (!state.debrisExamined || hasItem("madeira")) return;

    addItem("madeira");
    completeObjective("madeira");
    state.battery = Math.max(0, state.battery - WOOD_BATTERY_COST);
    updateBattery();
    refreshSceneUI();
}

export function goToGates() {
    if (!state.blindfoldOn) {
        showDialogue([
            "CUIDADO: Presença humana detectada!",
            "Mantenha a venda equipada a todo o momento."
        ], refreshSceneUI, "MEE SYSTEM");
        return;
    }

    loadScene("gates", startGatesSequence);
}

// PORTÕES

function followAgent() {
    state.gatesReady = true;
    loadScene("houseFront", () => {
        showDialogue([
            "A casa parece vazia... mas alguém esteve aqui recentemente."
        ], withObjective("aguardar-convocacao", "Aguarde em casa a convocação do Departamento", refreshSceneUI), "MEE SYSTEM");
    });
}

function startGatesSequence() {
    if (state.gatesReady) return;

    const incoming = getDialogue("incomingPeople");
    const officer = getDialogue("officerWelcome");

    showDialogue(incoming.lines, () => {
        swapBackground(GATES_OFFICER_IMAGE, async () => {
            await playDialogueSteps(officer.steps, dialogueActions);

            // Pedido do Agente ao fim da conversa nos portões
            setObjective("seguir-agente", "Siga o Agente até a casa");
            showChoiceDialogue("O Agente espera você. Seguir agora?", [
                { label: "Seguir O Agente", action: followAgent }
            ], "MEE SYSTEM");
        });
    }, incoming.speaker);
}

// Cada volta aos portões (com a venda) conta como uma advertência:
// 1ª e 2ª: aviso; 3ª: interrogatório; depois disso: eliminação.
const INTERROGATION_WARNING = 3;

function offerReturnHome() {
    showChoiceDialogue("O Agente aguarda que você volte para casa.", [
        { label: "Voltar para casa", action: () => loadScene("houseFront") }
    ], "MEE SYSTEM");
}

function warnPlayer() {
    const warning = getDialogue(state.warnings === 1 ? "officerWarning" : "officerWarning2");
    showDialogue(warning.lines, withObjective(
        "ficar-em-casa", "Volte para casa e não saia sem motivo", offerReturnHome
    ), warning.speaker);
}

export function returnToGates() {
    leaveHouse("gates", () => {
        state.warnings++;

        swapBackground(GATES_OFFICER_IMAGE, () => {
            if (state.warnings < INTERROGATION_WARNING) {
                warnPlayer();
            } else if (state.warnings === INTERROGATION_WARNING) {
                startInterrogation(withObjective(
                    "nao-voltar-portoes", "Não volte aos portões", offerReturnHome
                ));
            } else {
                eliminatePlayer(getDialogue("officerElimination").lines);
            }
        });
    });
}

// FRENTE DA CASA

export function examineTools() {
    if (state.toolsExamined) return;

    state.toolsExamined = true;
    showDialogue([
        "Há um martelo e alguns pregos entre as ferramentas."
    ], refreshSceneUI, "MEE SYSTEM");
}

export function collectTools() {
    if (!state.toolsExamined || (state.hasHammer && state.hasNails)) return;

    state.hasHammer = true;
    state.hasNails = true;
    addItem("martelo");
    showDialogue(["Ferramentas adicionadas ao inventário."], refreshSceneUI, "MEE SYSTEM");
}
