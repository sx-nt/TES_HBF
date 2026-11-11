// OBJETIVOS
// Módulo autocontido (estado, DOM e eventos próprios; estilos em
// css/objectives.css). API pública: setObjective, completeObjective,
// withObjective, resetObjectives, getObjectives, closeObjectives, initObjectives.
//
// Só entram aqui pedidos feitos por outros personagens (a máquina na praia,
// O Agente nos portões...). Falas do MEE e do MEE SYSTEM não geram objetivos.
// O aviso de novo objetivo é discreto: uma linha curta sob a barra superior
// e um ponto vermelho no botão "Objetivos" até o painel ser aberto.
import { notify } from "./notifications.js";

const NOTICE_MS = 2800;
const EMPTY_TEXT = "Nenhum objetivo no momento";

let objectives = [];
let noticeTimer = null;

const byId = (id) => document.getElementById(id);

// Começa sem objetivos: o primeiro vem da primeira conversa.
export function resetObjectives() {
    objectives = [];
    hideNotice();
    markUnseen(false);
    updateObjectives();
}

// Define um novo objetivo atual; os objetivos anteriores são concluídos.
// Um objetivo já dado (atual ou concluído) não é repetido nem reaberto.
export function setObjective(id, text) {
    if (objectives.some(objective => objective.id === id)) return;

    objectives.forEach(objective => {
        objective.done = true;
    });
    objectives.push({ id, text, done: false });

    updateObjectives();
    showNotice();
    notify("Objetivo atualizado", text);
}

export function completeObjective(id) {
    const objective = objectives.find(item => item.id === id);
    if (!objective || objective.done) return;
    objective.done = true;
    updateObjectives();
}

// Retorna um callback que define o objetivo e depois segue o fluxo normal
export function withObjective(id, text, next = null) {
    return () => {
        setObjective(id, text);
        if (next) next();
    };
}

export function getObjectives() {
    return objectives.map(objective => ({ ...objective }));
}

function updateObjectives() {
    const currentEl = byId("objectives-current");
    const listEl = byId("objectives-list");
    if (!currentEl || !listEl) return;

    const current = [...objectives].reverse().find(objective => !objective.done);
    currentEl.textContent = current ? current.text : EMPTY_TEXT;
    currentEl.classList.toggle("objective-empty", !current);

    listEl.replaceChildren();
    objectives.filter(objective => objective.done).forEach(objective => {
        const item = document.createElement("li");
        item.className = "objective-done";
        item.textContent = objective.text;
        listEl.appendChild(item);
    });

    listEl.classList.toggle("hidden", !listEl.children.length);
    byId("objectives-done-title")?.classList.toggle("hidden", !listEl.children.length);
}

// AVISO DISCRETO

function showNotice() {
    const notice = byId("objective-notice");
    markUnseen(true);
    if (!notice) return;

    notice.classList.remove("hidden", "objective-notice-show");
    void notice.offsetWidth;
    notice.classList.add("objective-notice-show");

    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(hideNotice, NOTICE_MS);
}

function hideNotice() {
    clearTimeout(noticeTimer);
    const notice = byId("objective-notice");
    notice?.classList.add("hidden");
    notice?.classList.remove("objective-notice-show");
}

function markUnseen(unseen) {
    byId("objectives-toggle")?.classList.toggle("objective-unseen", unseen);
}

function toggleObjectives() {
    const panel = byId("objectives");
    const button = byId("objectives-toggle");
    const isOpen = !panel.classList.contains("hidden");

    panel.classList.toggle("hidden", isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) {
        markUnseen(false);
        hideNotice();
    }
}

// Retorna true se o painel estava aberto (usado pelo Esc em main.js)
export function closeObjectives() {
    const panel = byId("objectives");
    const wasOpen = Boolean(panel && !panel.classList.contains("hidden"));

    panel?.classList.add("hidden");
    byId("objectives-toggle")?.setAttribute("aria-expanded", "false");
    return wasOpen;
}

export function initObjectives() {
    byId("objectives-toggle").addEventListener("click", toggleObjectives);
    byId("objectives-close").addEventListener("click", toggleObjectives);
    resetObjectives();
}
