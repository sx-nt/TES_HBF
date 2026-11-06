import { getDialogue } from "./data/dialogues.js";

const scenes = {
    beach: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/beach_d_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/beach_d_sem_venda.png"
        },
        hotspots: [
            {
                x: 20,
                y: 62,
                width: 17,
                height: 34,
                action: examineComputer
            },
            {
                x: 47,
                y: 58,
                width: 24,
                height: 36,
                action: examineDebris
            }
        ]
    },

    gates: {
        hasHuman: true,
        images: {
            blindfolded: "assets/maps/C_Venda/gates_com_venda.png",
            unblindfolded: "assets/maps/C_Venda/gates_officer.png"
        },
        hotspots: []
    },

    houseFront: {
        hasHuman: true,
        images: {
            blindfolded: "assets/maps/C_Venda/frente_casa_com_venda.png",
            unblindfolded: "assets/maps/C_Venda/frente_casa_com_venda.png"
        },
        hotspots: []
    },

    quarto: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/quarto_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/quarto_sem_venda.png"
        },
        hotspots: []
    },

    mirror: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/mirror_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/mirror_sem_venda.png"
        },
        hotspots: []
    },

    construcao: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/construcao_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/construcao_sem_venda.png"
        },
        hotspots: []
    },

    ww: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/ww_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/ww_sem_venda.png"
        },
        hotspots: []
    }
};


// ESTADO DO JOGO

let currentScene = null;
let hasBlindfold = false;
let blindfoldOn = false;
let computerExamined = false;
let debrisExamined = false;
let inventory = [];
let gatesReady = false;
let toolsExamined = false;
let hasHammer = false;
let hasNails = false;
let windowsExamined = false;
let windowsCovered = false;
let battery = 100;
let isPaused = false;
let bootInterval = null;


// FUNÇÕES AUXILIARES

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let skipBoot = false;

document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && finishTyping) {
        event.preventDefault();
        finishTyping();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;

    event.preventDefault();

    // Completa o texto atual
    if (finishTyping) {
        finishTyping();
        return;
    }

    // Pula o boot
    if (!document.getElementById("boot-screen").classList.contains("hidden")) {
        skipBoot = true;
    }
});

// TRANSIÇÃO CRT

function crtTransition(callback) {
    const transition = document.getElementById("crt-transition");

    transition.classList.remove("cover", "reveal");
    void transition.offsetWidth;

    transition.classList.add("cover");

    setTimeout(() => {
        callback();

        transition.classList.remove("cover");
        transition.classList.add("reveal");
    }, 180);

    setTimeout(() => {
        transition.classList.remove("reveal");
    }, 650);
}


// INTRODUÇÃO DO SISTEMA

const bootMessages = [
    "SYSTEM INITIALIZATION...",
    "Checking hardware........ OK",
    "Memory integrity......... OK",
    "Primary user identification... FAILED",
    "SYSTEM READY"
];

const bootLog = document.getElementById("boot-log");
const bootPrompt = document.getElementById("boot-prompt");


async function startBoot() {
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("boot-screen").classList.remove("hidden");
    document.getElementById("scene").classList.add("hidden");
    document.getElementById("interface").classList.add("hidden");
    document.getElementById("dialogue").classList.add("hidden");
    document.getElementById("game-over").classList.add("hidden");

    const counter = document.getElementById("year-counter");
    const yearText = document.getElementById("year-text");
    const progress = document.getElementById("progress");

    bootLog.innerHTML = "";
    bootPrompt.textContent = "";
    counter.classList.add("hidden");

    skipBoot = false;

    for (const message of bootMessages) {
        if (skipBoot) {
            startGame();
            return;
        }

        const line = document.createElement("p");
        line.textContent = message;
        bootLog.appendChild(line);

        await wait(900);
    }

    bootPrompt.textContent = "INSERT PRIMARY USER KEY";

    await wait(2000);

    bootPrompt.textContent = "NO INPUT DETECTED";

    await wait(1000);

    bootPrompt.textContent = "SYSTEM RECOVERY INITIATED";
    counter.classList.remove("hidden");

    for (let year = 1; year <= 87; year++) {
        yearText.textContent = `TIME ELAPSED: ${year} YEARS`;
        progress.style.width = (year / 87 * 100) + "%";

        if (skipBoot) {
            startGame();
            return;
        }

        await wait(35);
    }

    await wait(1000);

    bootPrompt.textContent = "SYSTEM OVERRIDE REQUIRED";

    await wait(1500);

    bootPrompt.textContent = "OVERRIDE ACCEPTED";

    await wait(1000);

    startGame();
}


// INICIAR JOGO

function startGame() {
    document.getElementById("boot-screen").classList.add("hidden");
    document.getElementById("scene").classList.add("hidden");
    document.getElementById("interface").classList.add("hidden");

    hasBlindfold = false;
    blindfoldOn = false;
    computerExamined = false;
    debrisExamined = false;
    inventory = [];
    gatesReady = false;
    toolsExamined = false;
    hasHammer = false;
    hasNails = false;
    windowsExamined = false;
    windowsCovered = false;
    battery = 100;
    isPaused = false;
    updateInventory();
    updateBattery();
    document.getElementById("top-hud").classList.remove("hidden");
    document.getElementById("pause-menu").classList.add("hidden");
    loadScene("beach");
}


// CARREGAR CENÁRIOS
function loadScene(sceneName, onLoaded = null) {
    const scene = scenes[sceneName];

    const imagePath = blindfoldOn
        ? scene.images.blindfolded
        : scene.images.unblindfolded;

    document.getElementById("scene-actions").innerHTML = "";

    const preload = new Image();

    preload.onload = () => {
        crtTransition(() => {
            currentScene = sceneName;

            const background = document.getElementById("background");

            background.classList.remove("scene-enter");
            background.src = imagePath;

            void background.offsetWidth;
            background.classList.add("scene-enter");

            document.getElementById("scene").classList.remove("hidden");
            document.getElementById("interface").classList.remove("hidden");
            document.getElementById("game").classList.toggle("blindfold-active", blindfoldOn);

            createHotspots(scene.hotspots || []);
            updateInterface();

            if (onLoaded) onLoaded();
        });
    };

    preload.onerror = () => {
        console.error("Erro ao carregar cenário:", imagePath);
    };

    preload.src = imagePath;
}


// ÁREAS CLICÁVEIS

function createHotspots(hotspots) {
    const container = document.getElementById("hotspots");

    container.innerHTML = "";

    hotspots.forEach(area => {
        const button = document.createElement("button");

        button.className = "hotspot";

        button.style.left = area.x + "%";
        button.style.top = area.y + "%";
        button.style.width = area.width + "%";
        button.style.height = area.height + "%";

        button.addEventListener("click", area.action);

        container.appendChild(button);
    });
}


// INTERFACE
function updateInterface() {
    const button = document.getElementById("blindfold-button");

    button.style.display = hasBlindfold || (debrisExamined && inventory.includes("madeira")) ? "block" : "none";

    button.textContent = !hasBlindfold
        ? "Colocar venda"
        : blindfoldOn
            ? "Retirar venda"
            : "Colocar venda";

    updateSceneActions();
}


function updateSceneActions() {
    const actions = document.getElementById("scene-actions");

    actions.innerHTML = "";

    if (currentScene === "beach") {
        if (!debrisExamined) {
            addAction("Examinar destroços", examineDebris);
        } else if (!inventory.includes("madeira")) {
            addAction("Coletar madeira", collectWood);
        }
        if (hasBlindfold) addAction("Ir para os portões", goToGates);
    }

    if (currentScene === "houseFront") {
        if (!toolsExamined) {
            addAction("Examinar ferramentas", examineTools);
        } else if (!hasHammer || !hasNails) {
            addAction("Examinar ferramentas novamente", examineTools);
        }

        if (toolsExamined) {
            addAction("Entrar na casa", () => loadScene("quarto"));
        }
    }

    if (currentScene === "quarto") {
        addAction("Examinar janela", examineWindow);
        if (windowsCovered && !blindfoldOn) {
            addAction("Examinar espelho", () => loadScene("mirror"));
            addAction("Ir para a construção", () => loadScene("construcao"));
        }
        addAction("Voltar aos portões", returnToGates);
    }

    if (currentScene === "mirror") {
        addAction("Voltar ao quarto", () => loadScene("quarto"));
    }

    if (currentScene === "construcao") {
        addAction("Voltar ao quarto", () => loadScene("quarto"));
    }
}


function addAction(label, callback) {
    const button = document.createElement("button");

    button.textContent = label;
    button.addEventListener("click", callback);

    document.getElementById("scene-actions").appendChild(button);
}


function updateInventory() {
    const inventoryEl = document.getElementById("inventory");
    const itemsEl = document.getElementById("inventory-items");
    if (!inventoryEl || !itemsEl) return;
    itemsEl.textContent = inventory.length
        ? inventory.map(item => item === "madeira" ? "MADEIRA" : item.toUpperCase()).join(" • ")
        : "Vazio";
}

function updateBattery() {
    const level = document.getElementById("battery-level");
    const value = document.getElementById("battery-value");
    if (!level || !value) return;
    level.style.width = `${battery}%`;
    value.textContent = `${battery}%`;
}

function toggleInventory() {
    const panel = document.getElementById("inventory");
    const button = document.getElementById("inventory-toggle");
    const isOpen = !panel.classList.contains("hidden");
    panel.classList.toggle("hidden", isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById("pause-menu").classList.toggle("hidden", !isPaused);
    document.getElementById("pause-button").setAttribute("aria-expanded", String(isPaused));
    document.getElementById("game").classList.toggle("paused", isPaused);
}

function examineDebris() {
    if (debrisExamined) return;
    computerExamined = true;
    const dialogue = getDialogue("computerIntro");
    playDialogueSteps(dialogue.steps).then(() => {
        debrisExamined = true;
        loadScene("beach", updateSceneActions);
    });
}

function receiveBlindfold() {
    if (!debrisExamined || !inventory.includes("madeira") || hasBlindfold) return;

    hasBlindfold = true;
    blindfoldOn = true;
    loadScene("beach", () => {
        showDialogue([
            "A venda foi ativada.",
            "Agora mantenha-a no rosto e siga as instruções do MEE."
        ], updateSceneActions, "MEE");
    });
}

function collectWood() {
    if (!debrisExamined || inventory.includes("madeira")) return;
    inventory.push("madeira");
    battery = Math.max(0, battery - 5);
    updateInventory();
    updateBattery();
    updateInterface();
    updateSceneActions();
}

function startGatesSequence() {
    if (gatesReady) return;
    const incoming = getDialogue("incomingPeople");
    const officer = getDialogue("officerWelcome");
  showDialogue(incoming.lines, () => {
  const officerPreload = new Image();
  officerPreload.onload = () => {
  const gatesBackground = document.getElementById("background");
  gatesBackground.src = "assets/maps/C_Venda/gates_officer.png";
  showDialogue(officer.lines, () => {
  showChoiceDialogue("Officer Gates espera você. Seguir agora?", [
  {
  label: "Seguir Officer Gates",
  action: () => {
  gatesReady = true;
  loadScene("houseFront");
  }
  }
  ], "OFFICER GATES");
  }, officer.speaker);
  };
  officerPreload.src = "assets/maps/C_Venda/gates_officer.png";
  }, incoming.speaker);
}

function examineTools() {
    toolsExamined = true;
    showChoiceDialogue(
        "Há um martelo e alguns pregos sobre a bancada. Você quer levar as ferramentas?",
        [
            {
                label: "Pegar martelo e pregos",
                action: () => {
                    hasHammer = true;
                    hasNails = true;
                    updateSceneActions();
                }
            },
            {
                label: "Deixar as ferramentas",
                action: updateSceneActions
            }
        ],
        "MEE"
    );
}

function examineWindow() {
    windowsExamined = true;
    const canCover = inventory.includes("madeira") && hasHammer && hasNails;
    if (!canCover) {
        showDialogue([
            "As janelas estão abertas.",
            "Preciso de madeira, um martelo e pregos para tapá-las.",
            "Não posso tirar a venda até que a casa esteja protegida."
        ], updateSceneActions, "MEE");
        return;
    }

    showChoiceDialogue(
        "As janelas podem ser tapadas agora. Usar a madeira e as ferramentas?",
        [
            { label: "Tapar as janelas", action: coverWindows },
            { label: "Ainda não", action: updateSceneActions }
        ],
        "MEE"
    );
}

function coverWindows() {
    windowsCovered = true;
    showDialogue([
        "As janelas estão tapadas.",
        "Agora posso retirar a venda com segurança e só então continuar o restante do puzzle."
    ], updateSceneActions, "MEE");
}

function returnToGates() {
    loadScene("gates", () => {
        const gatesBackground = document.getElementById("background");
        gatesBackground.src = "assets/maps/C_Venda/gates_officer.png";
        const officer = getDialogue("officerWelcome");
        showDialogue(officer.lines, () => {
            showChoiceDialogue("Officer Gates espera você. Seguir agora?", [
                { label: "Seguir Officer Gates", action: updateSceneActions }
            ], "OFFICER GATES");
        }, officer.speaker);
    });
}

// MECÂNICA DA VENDA

function toggleBlindfold() {
    if (!hasBlindfold) {
        activateBlindfold();
        return;
    }

    if (blindfoldOn) {
        if (scenes[currentScene].hasHuman || (currentScene !== "beach" && !windowsCovered)) {
            gameOver();
            return;
        }

        blindfoldOn = false;
    } else {
        blindfoldOn = true;
    }

    loadScene(currentScene);
}


// EFEITO DE TEXTO
let typingInterval = null;
let finishTyping = null;

function typeText(element, text, speed = 35) {
    return new Promise(resolve => {
        let index = 0;

        element.textContent = "";
        finishTyping = null;

        // CORREÇÃO: Se o texto for vazio ou nulo, resolve imediatamente (evita o UNDEFINED)
        if (!text || text.trim() === "") {
            resolve();
            return;
        }

        function finish() {
            if (typingInterval) {
                clearInterval(typingInterval);
                typingInterval = null;
            }

            element.textContent = text;
            finishTyping = null;
            resolve();
        }

        finishTyping = finish;

        typingInterval = setInterval(() => {
            // CORREÇÃO: Verifica se o caractere existe antes de adicionar
            if (text[index] !== undefined) {
                element.textContent += text[index];
            }
            
            index++;

            if (index >= text.length) {
                clearInterval(typingInterval);
                typingInterval = null;
                finishTyping = null;
                resolve();
            }
        }, speed);
    });
}


// FADE SOMENTE DO TEXTO
async function fadeText(element) {
    element.classList.add("fade-out");

    await wait(400);

    element.textContent = "";
    element.classList.remove("fade-out");
}


// ATUALIZA O SPEAKER E COR DO TEXTO
function updateSpeaker(speaker) {
    const speakerEl = document.getElementById("dialogue-speaker");
    const textEl = document.getElementById("dialogue-text");

    if (speaker && speaker.trim() !== "") {
        speakerEl.textContent = speaker;
        speakerEl.classList.remove("hidden");
    } else {
        speakerEl.textContent = "";
        speakerEl.classList.add("hidden");
    }

    // Se quem fala for o MEE, deixa o texto com uma cor diferenciada
    if (speaker === "MEE") {
        textEl.classList.add("mee-speech");
    } else {
        textEl.classList.remove("mee-speech");
    }
}


// DIÁLOGO COM OPÇÃO DE RESPOSTA
async function showChoiceDialogue(question, choicesList, speaker = "") {
    const dialogue = document.getElementById("dialogue");
    const text = document.getElementById("dialogue-text");
    const choices = document.getElementById("dialogue-choices");
    const next = document.getElementById("dialogue-next");

    dialogue.classList.remove("hidden");
    document.getElementById("game").classList.add("dialogue-active");

    choices.classList.add("hidden");
    next.classList.add("hidden");

    updateSpeaker(speaker);

    if (question && question.trim() !== "") {
        await typeText(text, question);
        await wait(800);
    } else {
        text.textContent = ""; // Garante que o texto fica vazio se não houver pergunta
    }

    choices.innerHTML = "";

    choicesList.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice.label;

        button.addEventListener("click", async () => {
            choices.querySelectorAll("button").forEach(btn => {
                btn.disabled = true;
            });

            await fadeText(text);
            choices.classList.add("hidden");
            dialogue.classList.add("hidden");
            document.getElementById("game").classList.remove("dialogue-active");

            if (choice.action) {
                choice.action();
            }
        });

        choices.appendChild(button);
    });

    choices.classList.remove("hidden");
}

// DIÁLOGO NORMAL COM BOTÃO CONTINUAR
function showDialogue(lines, callback = null, speaker = "MEE") {
    const dialogue = document.getElementById("dialogue");
    const text = document.getElementById("dialogue-text");
    const next = document.getElementById("dialogue-next");
    const choices = document.getElementById("dialogue-choices");

    let index = 0;
    let typing = false;
    let changingLine = false;

    dialogue.classList.remove("hidden");
    choices.classList.add("hidden");

    document.getElementById("game").classList.add("dialogue-active");

    updateSpeaker(speaker);

    async function showCurrentLine() {
        typing = true;
        next.classList.add("hidden");

        await typeText(text, lines[index]);

        typing = false;

        next.textContent = index === lines.length - 1
            ? "Continuar"
            : "Continuar";

        next.classList.remove("hidden");
    }

    next.onclick = async () => {
        if (typing || changingLine) return;

        changingLine = true;
        next.classList.add("hidden");

        await fadeText(text);

        if (index < lines.length - 1) {
            index++;
            changingLine = false;
            showCurrentLine();
        } else {
            dialogue.classList.add("hidden");
            document.getElementById("game").classList.remove("dialogue-active");

            next.onclick = null;
            changingLine = false;

            if (callback) {
                callback();
            }
        }
    };

    showCurrentLine();
}

function closeDialogue() {
    document.getElementById("dialogue").classList.add("hidden");
    document.getElementById("game").classList.remove("dialogue-active");
}

async function playDialogueSteps(steps) {
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
                        if (choice.steps) await playDialogueSteps(choice.steps);
                        if (choice.action === "receiveBlindfold") receiveBlindfold();
                        resolve();
                    }
                })), step.speaker);
            });
        }
    }
}

function examineComputer() {
    if (computerExamined) {
        const dialogue = getDialogue("computerAlreadyExamined");
        showDialogue(dialogue.lines, null, dialogue.speaker);
        return;
    }

    computerExamined = true;
    playDialogueSteps(getDialogue("computerIntro").steps);
}

// RECEBER A VENDA
// RECEBER A VENDA
function activateBlindfold() {
    hasBlindfold = true;
    blindfoldOn = true;

    closeDialogue();

    loadScene("beach", () => {
        // 1. MEE fala (na cor dele)
        showDialogue(
            ["Nossa... onde ele foi parar?"],
            () => {
                // 2. MEE SYSTEM dá as instruções
                showDialogue([
                    "Venda equipada.",
                    "Use o botão no canto direito inferior para colocar ou retirar a venda.",
                    "Quando equipada, as aparências já não são mais as mesmas...",
                    "Quando removida, seus segredos não podem mais ser mantidos ...",
                    "CUIDADO: Nunca remova a venda perto de humanos!",
                ], null, "MEE SYSTEM");
            },
            "MEE" // <-- O speaker "MEE" ativa a cor diferenciada no CSS
        );
    });
}

// IR PARA OS PORTÕES
function goToGates() {
    if (!blindfoldOn) {
        showDialogue([
            "CUIDADO: Presença humana detectada!",
            "Mantenha a venda equipada a todo o momento."
        ], null, "MEE SYSTEM");

        return;
    }

    loadScene("gates", startGatesSequence);
}


// GAME OVER
function gameOver() {
    document.getElementById("game-over").classList.remove("hidden");
    document.getElementById("interface").classList.add("hidden");
    document.getElementById("dialogue").classList.add("hidden");
}


// REINICIAR
function restartGame() {
    hasBlindfold = false;
    blindfoldOn = false;
    computerExamined = false;
    debrisExamined = false;
    inventory = [];
    gatesReady = false;
    toolsExamined = false;
    hasHammer = false;
    hasNails = false;
    windowsExamined = false;
    windowsCovered = false;
    battery = 100;
    isPaused = false;
    document.getElementById("top-hud").classList.add("hidden");
    document.getElementById("pause-menu").classList.add("hidden");
    updateInventory();
    updateBattery();

    if (bootInterval !== null) {
        clearInterval(bootInterval);
        bootInterval = null;
    }

    document.getElementById("year-counter").classList.add("hidden");
    document.getElementById("progress").style.width = "0%";

    startBoot();
}


// API mínima para a camada HTML e para futuras telas de menu.
window.startBoot = startBoot;
window.startGame = startGame;

// EVENTOS
document.getElementById("start-button").addEventListener("click", () => {
    crtTransition(() => {
        startBoot();
    });
});

document.getElementById("restart-button").addEventListener("click", restartGame);
document.getElementById("blindfold-button").addEventListener("click", toggleBlindfold);
document.getElementById("inventory-toggle").addEventListener("click", toggleInventory);
document.getElementById("pause-button").addEventListener("click", togglePause);
document.getElementById("resume-button").addEventListener("click", togglePause);
document.getElementById("pause-restart-button").addEventListener("click", () => {
    togglePause();
    restartGame();
});
