const backgroundMusic = new Audio(
    "assets/sfx/music/Kobold - The Cave of the Lost Talisman † HDK 02 (2017) (Dungeons & Dragons Inspired, Dungeon Synth) [_hEyfHg6rm0].mp3"
);

backgroundMusic.loop = true;
backgroundMusic.volume = 0.03;

export function playBackgroundMusic() {
    if (!backgroundMusic.paused) return;

    backgroundMusic.play().catch(error => {
        console.warn("Erro ao reproduzir música:", error);
    });
}

export function pauseBackgroundMusic() {
    backgroundMusic.pause();
}

const sounds = {

    boot: new Audio("assets/sfx/sound_boot.mp3"),
    transition: new Audio("assets/sfx/sound_transition.mp3"),
    

    ui: {
        cancel: new Audio("assets/sfx/ui/JDSherbert - Pixel UI SFX Pack - Cancel 1 (Saw).mp3"),
        cursor: new Audio("assets/sfx/ui/JDSherbert - Pixel UI SFX Pack - Cursor 1 (Saw).mp3"),
        error: new Audio("assets/sfx/ui/JDSherbert - Pixel UI SFX Pack - Cursor 2 (Sine).mp3"),
        popupClose: new Audio("assets/sfx/ui/JDSherbert - Pixel UI SFX Pack - Popup Close 1 (Saw).mp3"),
        popupOpen: new Audio("assets/sfx/ui/JDSherbert - Pixel UI SFX Pack - Popup Open 1 (Saw).mp3"),
        select: new Audio("assets/sfx/ui/JDSherbert - Pixel UI SFX Pack - Select 1 (Saw).mp3")
        
    }
};

Object.values(sounds.ui).forEach(audio => {
    audio.volume = 0.03;
});

sounds.boot.loop = true;
sounds.boot.volume = 0.35;
sounds.transition.volume = 0.2;

function play(audio) {
    audio.pause();
    audio.currentTime = 0;

    audio.play().catch(error => {
        console.warn("Erro ao reproduzir áudio:", error);
    });
}

export function playBootSound() {
    play(sounds.boot);
}

export function stopBootSound() {
    sounds.boot.pause();
    sounds.boot.currentTime = 0;
}

export function playTransitionSound() {
    play(sounds.transition);
}

export function playUiSound(name) {
    const audio = sounds.ui[name];

    if (audio) {
        play(audio);
    }
}

const POPUP_TOGGLES = {
    "inventory-toggle": "inventory",
    "objectives-toggle": "objectives",
    "pause-button": "pause-menu"
};

const POPUP_CLOSE_BUTTONS = [
    "inventory-close", "objectives-close", "safe-cancel", "document-close", "book-close"
];

export function setupUiSounds() {
    document.addEventListener("click", event => {
        const button = event.target.closest("button");

        if (!button || button.disabled) return;

        const id = button.id;
        const text = button.textContent.trim().toLowerCase();

        if (
            id === "resume-button" ||
            id === "start-button" ||
            text === "continuar"
        ) return;


        // Lê o estado do painel antes do clique alterá-lo (fase de captura)
        const panelId = POPUP_TOGGLES[id];
        if (panelId) {
            const panel = document.getElementById(panelId);

            playUiSound(
                panel.classList.contains("hidden")
                    ? "popupOpen"
                    : "popupClose"
            );
            return;
        }

        if (POPUP_CLOSE_BUTTONS.includes(id)) {
            playUiSound("popupClose");
            return;
        }

        if (
            text.includes("cancelar") ||
            text.includes("voltar") ||
            text.includes("sair")
        ) {
            playUiSound("cancel");
            return;
        }

        playUiSound("select");
    }, true);
}