// OBJETIVOS
// Módulo autocontido (estado, DOM e eventos próprios; estilos em
// css/objectives.css). API pública: setObjective, completeObjective,
// withObjective, resetObjectives, getObjectives, closeObjectives, initObjectives.

const INITIAL_OBJECTIVE = { id: "destrocos", text: "Examine os destroços na praia" };
const TOAST_MS = 3500;

let objectives = [];
let objectiveToastTimer = null;

const byId = (id) => document.getElementById(id);

// Objetivo inicial (definido sem notificação ao iniciar/reiniciar)
export function resetObjectives() {
    objectives = [{ ...INITIAL_OBJECTIVE, done: false }];
    clearTimeout(objectiveToastTimer);
    byId("objective-toast")?.classList.add("hidden");
    byId("objectives-toggle")?.classList.remove("objective-pulse");
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
    showObjectiveToast(text);
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
    currentEl.textContent = current ? current.text : "Nenhum objetivo no momento";

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

function showObjectiveToast(text) {
    const toast = byId("objective-toast");
    const button = byId("objectives-toggle");
    if (!toast) return;

    byId("objective-toast-text").textContent = text;
    toast.classList.remove("hidden", "objective-toast-show");
    void toast.offsetWidth;
    toast.classList.add("objective-toast-show");

    if (button) {
        button.classList.remove("objective-pulse");
        void button.offsetWidth;
        button.classList.add("objective-pulse");
    }

    clearTimeout(objectiveToastTimer);
    objectiveToastTimer = setTimeout(() => toast.classList.add("hidden"), TOAST_MS);
}

function toggleObjectives() {
    const panel = byId("objectives");
    const button = byId("objectives-toggle");
    const isOpen = !panel.classList.contains("hidden");

    panel.classList.toggle("hidden", isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
    button.classList.remove("objective-pulse");
}

export function closeObjectives() {
    byId("objectives")?.classList.add("hidden");
    byId("objectives-toggle")?.setAttribute("aria-expanded", "false");
}

export function initObjectives() {
    byId("objectives-toggle").addEventListener("click", toggleObjectives);
    byId("objectives-close").addEventListener("click", toggleObjectives);
    resetObjectives();
}
