// PAINEL DA SENHA DO COFRE
import { $ } from "../core/utils.js";

let safeCode = "";
let onUnlock = null;

export function openSafePanel() {
    const input = $("safe-code");
    const feedback = $("safe-feedback");

    $("safe-panel").classList.remove("hidden");
    feedback.textContent = "";
    feedback.className = "safe-feedback";
    input.value = "";
    input.focus();
}

export function closeSafePanel() {
    $("safe-panel").classList.add("hidden");
}

function submitSafeCode() {
    const feedback = $("safe-feedback");

    if ($("safe-code").value.trim() !== safeCode) {
        feedback.textContent = "SENHA INCORRETA";
        feedback.className = "safe-feedback error";
        return;
    }

    closeSafePanel();
    onUnlock?.();
}

function handleKeydown(event) {
    if (event.key === "Enter") submitSafeCode();
    if (event.key === "Escape") closeSafePanel();
}

export function initSafePanel({ code, onUnlock: callback }) {
    safeCode = code;
    onUnlock = callback;

    $("safe-cancel").addEventListener("click", closeSafePanel);
    $("safe-submit").addEventListener("click", submitSafeCode);
    $("safe-code").addEventListener("keydown", handleKeydown);
}
