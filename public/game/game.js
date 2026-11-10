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
    },

    quadroZoom: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/S_Venda/zoom_quadro_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/zoom_quadro_sem_venda.png"
        },
        hotspots: []
    },

    cofre: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/S_Venda/zoom_cofre_sem_venda.png",
            unblindfolded: "assets/maps/S_Venda/zoom_cofre_sem_venda.png"
        },
        hotspots: []
    },

    cofreAberto: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/S_Venda/zoom_cofre_aberto.png",
            unblindfolded: "assets/maps/S_Venda/zoom_cofre_aberto.png"
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
let pictureExamined = false;
let safeOpen = false;
let bookCollected = false;
let keyCollected = false;
let cabinetUnlocked = false;
let passwordFound = false;
let machineExamined = false;
  let machineZoomActive = false;
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
    pictureExamined = false;
    safeOpen = false;
    bookCollected = false;
    keyCollected = false;
    cabinetUnlocked = false;
    passwordFound = false;
machineExamined = false;
  machineZoomActive = false;
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

    let imagePath = blindfoldOn
        ? scene.images.blindfolded
        : scene.images.unblindfolded;

    if (sceneName === "quarto" && !blindfoldOn && pictureExamined) {
        imagePath = "assets/maps/S_Venda/quarto_sem_venda_cofre.png";
    }

    if (sceneName === "construcao" && machineZoomActive && !blindfoldOn) {
        imagePath = "assets/maps/S_Venda/maquina_zoom_sem_venda.png";
    }

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

            const mirrorKeyOverlay = document.getElementById("mirror-key-overlay");
            if (mirrorKeyOverlay) {
                mirrorKeyOverlay.classList.toggle("hidden", !(sceneName === "mirror" && !blindfoldOn && !keyCollected));
            }

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
        if (!toolsExamined) addAction("Examinar ferramentas", examineTools);
        if (toolsExamined && (!hasHammer || !hasNails)) addAction("Coletar ferramentas", collectTools);
        addAction("Entrar na casa", () => loadScene("quarto"));
    }

    if (currentScene === "quarto") {
    if (!windowsCovered) addAction("Examinar janelas", examineWindow);
    addAction("Examinar quadro", examinePicture);
        addAction("Examinar espelho", () => loadScene("mirror"));
        addAction("Examinar armário", examineCabinet);
        if (windowsCovered && !blindfoldOn && toolsExamined && hasHammer && hasNails) {
            addAction("Ir para a construção", () => loadScene("construcao"));
        }
        addAction("Voltar aos portões", returnToGates);
    }

    if (currentScene === "quadroZoom") {
        if (!pictureExamined) addAction("Remover o quadro", removePicture);
        if (pictureExamined) addAction("Acessar cofre", () => loadScene("cofre"));
        addAction("Voltar ao quarto", () => loadScene("quarto"));
    }

    if (currentScene === "cofre") {
        addAction("Voltar", () => loadScene("quadroZoom"));
        if (!safeOpen) {
            addAction("Inserir senha", openSafePanel);
        }
    }

    if (currentScene === "cofreAberto") {
        if (!bookCollected) addAction("Pegar o livro", collectBook);
        addAction("Voltar ao quarto", () => loadScene("quarto"));
    }

    if (currentScene === "ww") {
        if (!windowsCovered) addAction("Tapar as janelas", coverWindows);
        addAction("Voltar ao quarto", () => loadScene("quarto"));
    }

    if (currentScene === "mirror") {
        if (!keyCollected && !blindfoldOn) {
            addAction("Coletar chave", collectKey);
        }
        addAction("Voltar ao quarto", () => loadScene("quarto"));
    }

    if (currentScene === "construcao") {
        if (!machineExamined) addAction("Examinar máquina destruída", examineMachine);
        else addAction("Interagir com a máquina", examineMachine);
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
    const itemsEl = document.getElementById("inventory-items");
    if (!itemsEl) return;
    itemsEl.replaceChildren();
    if (!inventory.length) {
        itemsEl.textContent = "Vazio";
        return;
    }

    inventory.forEach((item) => {
        const card = document.createElement("div");
        card.className = "inventory-item";
        const image = document.createElement("img");
        image.src = item === "chave do armário" ? "assets/items/chave.png" : "assets/images/eye_open_icon.png";
        image.alt = item;
        const label = document.createElement("span");
        label.textContent = item.toUpperCase();
        card.append(image, label);
        itemsEl.appendChild(card);
    });
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

function updateBlindfoldButton() {
    const button = document.getElementById("blindfold-button");
    if (!button) return;
    button.replaceChildren();
    const image = document.createElement("img");
    image.src = blindfoldOn ? "assets/images/eye_closed_icon.png" : "assets/images/eye_open_icon.png";
    image.alt = blindfoldOn ? "Colocar venda" : "Retirar venda";
    button.appendChild(image);
    button.setAttribute("aria-label", blindfoldOn ? "Retirar venda" : "Colocar venda");
}

function saveGame() {
    const saveState = {
        blindfoldOn, hasBlindfold, computerExamined, debrisExamined, inventory,
        gatesReady, toolsExamined, hasHammer, hasNails, windowsExamined, windowsCovered,
        pictureExamined, safeOpen, bookCollected, keyCollected, cabinetUnlocked,
        passwordFound, machineExamined, machineZoomActive, battery, currentScene
    };
    localStorage.setItem("mee-save", JSON.stringify(saveState));
    document.getElementById("save-feedback").textContent = "Jogo salvo neste navegador.";
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

            // Executa todas as etapas do diálogo do agente
            playDialogueSteps(officer.steps).then(() => {
                showChoiceDialogue("O Agente espera você. Seguir agora?", [
                    {
                        label: "Seguir O Agente",
                        action: () => {
                            gatesReady = true;
                            loadScene("houseFront", () => {
                                showDialogue([
                                    "MEE chega à residência designada.",
                                    "A casa parece vazia... mas alguém esteve aqui recentemente.",
                                    "Vou entrar e examinar o local."
                                ], updateSceneActions, "MEE");
                            });
                        }
                    }
                ], "O AGENTE");
            });
        };

        officerPreload.onerror = () => {
            console.error("Erro ao carregar imagem do agente.");
        };

        officerPreload.src = "assets/maps/C_Venda/gates_officer.png";

    }, incoming.speaker);
}

function examineTools() {
    if (toolsExamined) return;
    toolsExamined = true;
    showDialogue([
        "Há um martelo e alguns pregos entre as ferramentas.",
        "Preciso coletar tudo antes de deixar esta ação concluída."
    ], updateSceneActions, "MEE");
}

function collectTools() {
    if (!toolsExamined || (hasHammer && hasNails)) return;
    hasHammer = true;
    hasNails = true;
    inventory.push("martelo", "pregos");
    updateInventory();
    showDialogue(["Martelo e pregos adicionados ao inventário."], updateSceneActions, "MEE SYSTEM");
}

function collectKey() {
    if (blindfoldOn || keyCollected) {
        if (blindfoldOn) showDialogue(["Não consigo encontrar a chave enquanto estou vendado."], updateSceneActions, "MEE");
        return;
    }
  keyCollected = true;
  const mirrorKeyOverlay = document.getElementById("mirror-key-overlay");
  if (mirrorKeyOverlay) mirrorKeyOverlay.classList.add("hidden");
  inventory.push("chave do armário");
    updateInventory();
    showDialogue(["A chave encontrada no espelho foi adicionada ao inventário."], updateSceneActions, "MEE SYSTEM");
}

function examineCabinet() {
    if (blindfoldOn) {
        showDialogue(["Não consigo examinar o armário enquanto estou vendado."], updateSceneActions, "MEE");
        return;
    }

    if (!cabinetUnlocked) {
        if (!keyCollected) {
            showDialogue(["O armário está trancado. Preciso encontrar uma chave."], updateSceneActions, "MEE");
            return;
        }
        cabinetUnlocked = true;
    }

    if (!passwordFound) {
        passwordFound = true;
        inventory.push("senha do cofre");
        updateInventory();
        showDialogue(["A gaveta está aberta. A senha do cofre foi adicionada ao inventário."], updateSceneActions, "MEE SYSTEM");
    } else {
        showDialogue(["O armário está destrancado. A gaveta já foi examinada."], updateSceneActions, "MEE");
    }
}

function examineMachine() {
    if (!machineExamined) {
        machineExamined = true;
        machineZoomActive = true;
        loadScene("construcao", () => showDialogue(
            ["A máquina destruída ainda guarda sinais de energia."],
            () => {
                machineZoomActive = false;
                loadScene("construcao");
            },
            "MEE"
        ));
        return;
    }
    showDialogue(["Não há mais nada que eu possa retirar da máquina."], updateSceneActions, "MEE");
}

function examinePicture() {
    if (blindfoldOn) {
        showDialogue(["Não consigo examinar o quadro enquanto estou vendado."], updateSceneActions, "MEE");
        return;
    }

    loadScene("quadroZoom", () => {
        showDialogue(["Parece que tem algo de estranho nesse quadro..."], updateSceneActions, "MEE");
    });
}

function removePicture() {
    pictureExamined = true;
    loadScene("cofre", () => {
        showDialogue(["O quadro escondia um cofre embutido na parede."], updateSceneActions, "MEE");
    });
}

function openSafePanel() {
    const panel = document.getElementById("safe-panel");
    const input = document.getElementById("safe-code");
    const feedback = document.getElementById("safe-feedback");
    panel.classList.remove("hidden");
    feedback.textContent = "";
    input.value = "";
    input.focus();
}

function closeSafePanel() {
    document.getElementById("safe-panel").classList.add("hidden");
}

function submitSafeCode() {
    const input = document.getElementById("safe-code");
    const feedback = document.getElementById("safe-feedback");
    if (input.value.trim() !== "03030") {
        feedback.textContent = "SENHA INCORRETA";
        feedback.className = "safe-feedback error";
        return;
    }

    safeOpen = true;
    closeSafePanel();
    loadScene("cofreAberto", () => {
        showDialogue(["Senha correta. O cofre foi aberto.", "Há um livro dentro. Vou guardá-lo."], updateSceneActions, "MEE");
    });
}

function collectBook() {
    if (bookCollected) return;
    bookCollected = true;
    inventory.push("livro");
    updateInventory();
    updateSceneActions();
    showDialogue(["Livro adicionado ao inventário."], updateSceneActions, "MEE SYSTEM");
}

function examineWindow() {
    if (!windowsExamined) windowsExamined = true;
    loadScene("ww", () => {
        showDialogue([
            "Parece que estou sendo vigiado...",
            "Preciso fazer algo para que possa tirar a venda sem ser pego.",
            "Talvez a madeira e as ferramentas possam ser úteis."
        ], updateSceneActions, "MEE");
    });
}

function coverWindows() {
    if (!toolsExamined || !hasHammer || !hasNails) {
        showDialogue(["Ainda não posso tapar as janelas: preciso coletar o martelo e os pregos."], updateSceneActions, "MEE SYSTEM");
        return;
    }
    windowsCovered = true;

    loadScene("quarto", () => {
        if (blindfoldOn) {
            document.getElementById("background").src = "assets/maps/C_Venda/quarto_com_venda_janela_tapada.png";
        }

        showDialogue([
            "Ótimo. Agora que as janelas estão cobertas, posso retirar a venda sem correr o risco de ser visto."
        ], null, "MEE");

        updateSceneActions();
    });
}

function returnToGates() {
    if (!hasBlindfold || blindfoldOn) {
        gameOver();
        return;
    }

    loadScene("gates", () => {
        const gatesBackground = document.getElementById("background");
        gatesBackground.src = "assets/maps/C_Venda/gates_officer.png";
        const officer = getDialogue("officerWelcome");
        showDialogue(["Oi. Ainda está por aqui?"], () => {
            showChoiceDialogue("O Agente aguarda sua decisão.", [
                { label: "Voltar para casa", action: () => loadScene("houseFront") },
                { label: "Voltar para a praia", action: () => loadScene("beach") }
            ], "O AGENTE");
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
let typingVoice = null;

const dialogueVoiceBySpeaker = {
    "MAQUINA": "assets/sfx/voices/voice_maquina.mp3",
    "MÁQUINA": "assets/sfx/voices/voice_maquina.mp3",
    "O AGENTE": "assets/sfx/voices/voice_officer.mp3",
    "AGENTE": "assets/sfx/voices/voice_officer.mp3",
    "MEE SYSTEM": "assets/sfx/voices/voice_system.mp3",
    "SISTEMA": "assets/sfx/voices/voice_system.mp3"
};

function stopTypingVoice() {
    if (!typingVoice) return;

    typingVoice.pause();
    typingVoice.currentTime = 0;
    typingVoice = null;
}

function startTypingVoice() {
    stopTypingVoice();

  const speaker = document.getElementById("dialogue-speaker")?.textContent?.trim().toUpperCase();
  const isDestroyedMachineDialogue = currentScene === "construcao" && machineZoomActive;
  const voicePath = isDestroyedMachineDialogue
    ? dialogueVoiceBySpeaker["MAQUINA"]
    : dialogueVoiceBySpeaker[speaker] || dialogueVoiceBySpeaker["MEE SYSTEM"];
  typingVoice = new Audio(voicePath);
    typingVoice.loop = true;
    typingVoice.volume = 0.35;
    typingVoice.play().catch(() => {});
}

function typeText(element, text, speed = 35) {
    return new Promise(resolve => {
        let index = 0;

        element.textContent = "";
        finishTyping = null;
        startTypingVoice();

        if (!text || text.trim() === "") {
            stopTypingVoice();
            resolve();
            return;
        }

        function finish() {
            if (typingInterval) {
                clearInterval(typingInterval);
                typingInterval = null;
            }

            stopTypingVoice();
            element.textContent = text;
            finishTyping = null;
            resolve();
        }

        finishTyping = finish;

        typingInterval = setInterval(() => {
            if (text[index] !== undefined) {
                element.textContent += text[index];
            }

            index++;

            if (index >= text.length) {
                clearInterval(typingInterval);
                typingInterval = null;
                stopTypingVoice();
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
    if (hasBlindfold) {
        blindfoldOn = true;
        loadScene(currentScene);
        return;
    }

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
                    "Use o botão no canto superior esquerdo para colocar ou retirar a venda.",
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
    pictureExamined = false;
    safeOpen = false;
    bookCollected = false;
    keyCollected = false;
    cabinetUnlocked = false;
    passwordFound = false;
machineExamined = false;
  machineZoomActive = false;
  battery = 100;
    isPaused = false;
    document.getElementById("top-hud").classList.add("hidden");
    document.getElementById("pause-menu").classList.add("hidden");
    updateInventory();
    updateBattery();
    updateBlindfoldButton();

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
document.getElementById("safe-cancel").addEventListener("click", closeSafePanel);
document.getElementById("safe-submit").addEventListener("click", submitSafeCode);
document.getElementById("safe-code").addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitSafeCode();
});
document.getElementById("blindfold-button").addEventListener("click", toggleBlindfold);
document.getElementById("inventory-toggle").addEventListener("click", toggleInventory);
document.getElementById("inventory-close").addEventListener("click", toggleInventory);
document.getElementById("save-button").addEventListener("click", saveGame);
updateBlindfoldButton();
document.getElementById("pause-button").addEventListener("click", togglePause);
document.getElementById("resume-button").addEventListener("click", togglePause);
document.getElementById("pause-restart-button").addEventListener("click", () => {
    togglePause();
    restartGame();
});
