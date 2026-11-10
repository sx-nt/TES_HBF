// CAIXA DE DIÁLOGO
// Efeito de digitação, vozes, diálogos simples, diálogos com escolha e
// sequências de etapas vindas de data/dialogues.json.
import { $, wait } from "../core/utils.js";

const TYPING_SPEED_MS = 35;
const FADE_MS = 400;
const CHOICE_DELAY_MS = 800;

const VOICES = {
    machine: "assets/sfx/voices/voice_maquina.mp3",
    officer: "assets/sfx/voices/voice_officer.mp3",
    system: "assets/sfx/voices/voice_system.mp3"
};
const OFFICER_SPEAKERS = ["O AGENTE", "AGENTE", "??"];
const SYSTEM_SPEAKERS = ["MEE SYSTEM", "SISTEMA"];

let typingVoice = null;
let voiceOverride = null;
let typingInterval = null;
let finishTyping = null;
// Cada diálogo aberto recebe um id; ao abrir outro ou cancelar, os
// callbacks pendentes do anterior são ignorados.
let session = 0;

export function setVoiceOverride(voice) {
    voiceOverride = voice;
}

export function isDialogueOpen() {
    return !$("dialogue").classList.contains("hidden");
}

// VOZES

function stopTypingVoice() {
    if (!typingVoice) return;
    typingVoice.pause();
    typingVoice.currentTime = 0;
    typingVoice = null;
}

function voiceFor(speaker) {
    const name = (speaker || "").trim().toUpperCase();
    if (name === "MEE") return null; // MEE nunca possui voz
    if (voiceOverride === "machine") return VOICES.machine;
    if (OFFICER_SPEAKERS.includes(name)) return VOICES.officer;
    if (SYSTEM_SPEAKERS.includes(name)) return VOICES.system;
    return null;
}

function startTypingVoice(speaker) {
    stopTypingVoice();

    const path = voiceFor(speaker);
    if (!path) return;

    typingVoice = new Audio(path);
    typingVoice.loop = true;
    typingVoice.volume = 0.4;
    typingVoice.play().catch(error => console.warn("Erro ao reproduzir voz:", error));
}

// EFEITO DE TEXTO

// Completa o texto sendo digitado. Retorna true se havia texto em digitação.
export function skipTyping() {
    if (!finishTyping) return false;
    finishTyping();
    return true;
}

function typeText(element, text, speaker) {
    // Uma digitação anterior é concluída (e sua Promise resolvida)
    skipTyping();

    return new Promise(resolve => {
        element.textContent = "";

        if (!text || text.trim() === "") {
            resolve();
            return;
        }

        let index = 0;

        finishTyping = () => {
            clearInterval(typingInterval);
            typingInterval = null;
            finishTyping = null;
            stopTypingVoice();
            element.textContent = text;
            resolve();
        };

        startTypingVoice(speaker);

        typingInterval = setInterval(() => {
            index++;
            element.textContent = text.slice(0, index);
            if (index >= text.length) finishTyping();
        }, TYPING_SPEED_MS);
    });
}

async function fadeText(element) {
    element.classList.add("fade-out");
    await wait(FADE_MS);
    element.textContent = "";
    element.classList.remove("fade-out");
}

// CAIXA

function elements() {
    return {
        box: $("dialogue"),
        speaker: $("dialogue-speaker"),
        text: $("dialogue-text"),
        next: $("dialogue-next"),
        choices: $("dialogue-choices")
    };
}

function openBox(speaker) {
    const { box, speaker: speakerEl, text, next, choices } = elements();

    box.classList.remove("hidden");
    $("game").classList.add("dialogue-active");

    next.onclick = null;
    next.classList.add("hidden");
    choices.classList.add("hidden");
    choices.replaceChildren();

    const hasSpeaker = Boolean(speaker && speaker.trim() !== "");
    speakerEl.textContent = hasSpeaker ? speaker : "";
    speakerEl.classList.toggle("hidden", !hasSpeaker);

    // Falas do MEE têm uma cor diferenciada
    text.classList.toggle("mee-speech", speaker === "MEE");

    return ++session;
}

function closeBox() {
    $("dialogue").classList.add("hidden");
    $("game").classList.remove("dialogue-active");
}

// Fecha qualquer diálogo aberto e descarta seus callbacks.
export function closeDialogue() {
    session++;
    skipTyping();
    stopTypingVoice();
    voiceOverride = null;

    const { text, next, choices } = elements();
    next.onclick = null;
    choices.replaceChildren();
    text.classList.remove("fade-out");
    closeBox();
}

// DIÁLOGO NORMAL COM BOTÃO CONTINUAR
export function showDialogue(lines, callback = null, speaker = "MEE") {
    const { text, next } = elements();
    const id = openBox(speaker);
    let index = 0;
    let busy = true;

    async function showCurrentLine() {
        busy = true;
        next.classList.add("hidden");

        await typeText(text, lines[index], speaker);
        if (id !== session) return;

        busy = false;
        next.classList.remove("hidden");
    }

    next.onclick = async () => {
        if (busy || id !== session) return;

        busy = true;
        next.classList.add("hidden");

        await fadeText(text);
        if (id !== session) return;

        if (index < lines.length - 1) {
            index++;
            showCurrentLine();
            return;
        }

        next.onclick = null;
        closeBox();
        if (callback) callback();
    };

    showCurrentLine();
}

// DIÁLOGO COM OPÇÕES DE RESPOSTA
export async function showChoiceDialogue(question, options, speaker = "") {
    const { text, choices } = elements();
    const id = openBox(speaker);

    if (question && question.trim() !== "") {
        await typeText(text, question, speaker);
        await wait(CHOICE_DELAY_MS);
        if (id !== session) return;
    } else {
        text.textContent = "";
    }

    options.forEach(option => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = option.label;

        button.addEventListener("click", async () => {
            if (id !== session) return;
            choices.querySelectorAll("button").forEach(btn => { btn.disabled = true; });

            await fadeText(text);
            if (id !== session) return;

            choices.classList.add("hidden");
            closeBox();
            if (option.action) option.action();
        });

        choices.appendChild(button);
    });

    choices.classList.remove("hidden");
}

// SEQUÊNCIA DE ETAPAS (data/dialogues.json)
// handlers mapeia os nomes de "action" do JSON para funções do jogo.
export async function playDialogueSteps(steps, handlers = {}) {
    for (const step of steps) {
        if (step.type === "lines") {
            await new Promise(resolve => showDialogue(step.lines, resolve, step.speaker));
            continue;
        }

        if (step.type === "choice") {
            await new Promise(resolve => {
                showChoiceDialogue(step.question || "", step.choices.map(choice => ({
                    label: choice.label,
                    action: async () => {
                        if (choice.steps) await playDialogueSteps(choice.steps, handlers);
                        if (choice.action) handlers[choice.action]?.();
                        resolve();
                    }
                })), step.speaker);
            });
        }
    }
}
