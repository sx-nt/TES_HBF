// INTRODUÇÃO DO SISTEMA (tela de boot)
import { $ } from "../core/utils.js";
import { playBootSound, pauseBackgroundMusic } from "../core/audio.js";

const BOOT_MESSAGES = [
    "SYSTEM INITIALIZATION...",
    "Checking hardware........ OK",
    "Memory integrity......... OK",
    "Primary user identification... FAILED",
    "SYSTEM READY"
];
const YEARS_ELAPSED = 87;

// Cada boot recebe um id; um boot novo invalida o anterior.
let bootRun = 0;
let skipRequested = false;
let skipWaiter = null;

export function isBootActive() {
    return !$("boot-screen").classList.contains("hidden");
}

// Pula o boot (Espaço). Interrompe a espera atual imediatamente.
export function skipBoot() {
    if (!isBootActive()) return false;
    skipRequested = true;
    skipWaiter?.();
    return true;
}

function bootWait(ms) {
    return new Promise(resolve => {
        const done = () => {
            clearTimeout(timer);
            skipWaiter = null;
            resolve();
        };
        const timer = setTimeout(done, ms);
        skipWaiter = done;
    });
}

function showBootScreen() {
    ["start-screen", "scene", "interface", "dialogue", "game-over", "chapter-end"]
        .forEach(id => $(id).classList.add("hidden"));
    $("boot-screen").classList.remove("hidden");

    $("boot-log").replaceChildren();
    $("boot-prompt").textContent = "";
    $("year-counter").classList.add("hidden");
    $("year-text").textContent = "TIME ELAPSED: 0 YEARS";
    $("progress").style.width = "0%";
}

// Executa o boot e chama onComplete ao terminar ou ao ser pulado.
export async function startBoot(onComplete) {
    const run = ++bootRun;
    skipRequested = false;

    showBootScreen();
    pauseBackgroundMusic();
    playBootSound();

    const log = $("boot-log");
    const prompt = $("boot-prompt");

    // Espera e informa se o boot deve continuar normalmente
    const proceed = async (ms) => {
        await bootWait(ms);
        return run === bootRun && !skipRequested;
    };
    const finish = () => {
        if (run !== bootRun) return;
        bootRun++;
        onComplete();
    };

    for (const message of BOOT_MESSAGES) {
        const line = document.createElement("p");
        line.textContent = message;
        log.appendChild(line);
        if (!await proceed(900)) return finish();
    }

    prompt.textContent = "INSERT PRIMARY USER KEY";
    if (!await proceed(2000)) return finish();

    prompt.textContent = "NO INPUT DETECTED";
    if (!await proceed(1000)) return finish();

    prompt.textContent = "SYSTEM RECOVERY INITIATED";
    $("year-counter").classList.remove("hidden");

    for (let year = 1; year <= YEARS_ELAPSED; year++) {
        $("year-text").textContent = `TIME ELAPSED: ${year} YEARS`;
        $("progress").style.width = (year / YEARS_ELAPSED * 100) + "%";
        if (!await proceed(35)) return finish();
    }

    if (!await proceed(1000)) return finish();

    prompt.textContent = "SYSTEM OVERRIDE REQUIRED";
    if (!await proceed(1500)) return finish();

    prompt.textContent = "OVERRIDE ACCEPTED";
    await proceed(1000);

    finish();
}
