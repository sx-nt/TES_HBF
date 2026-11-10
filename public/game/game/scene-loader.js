// CARREGAMENTO DE CENÁRIOS
import { state } from "../core/state.js";
import { $, preloadImage } from "../core/utils.js";
import { scenes } from "../data/scenes.js";
import { crtTransition } from "../ui/transitions.js";
import { isDialogueOpen } from "../ui/dialogue.js";

// Função que redesenha a interface do cenário (ações + botão da venda).
// Registrada por main.js para este módulo não depender de game/actions.js.
let renderSceneUI = () => {};
// Só a requisição de cenário mais recente é aplicada
let loadToken = 0;

export function setSceneUIRenderer(renderer) {
    renderSceneUI = renderer;
}

export function refreshSceneUI() {
    if (state.isGameOver) return;
    renderSceneUI();
}

// Interações com o cenário ficam bloqueadas durante transições,
// diálogos, pausa e game over.
export function isInteractionBlocked() {
    return state.sceneLoading || state.isGameOver || state.isPaused || isDialogueOpen();
}

function setLoading(loading) {
    state.sceneLoading = loading;
    $("game").classList.toggle("scene-loading", loading);
}

// Cancela um carregamento em andamento (game over / reinício)
export function cancelSceneLoad() {
    loadToken++;
    setLoading(false);
}

function resolveSceneImage(scene, sceneName) {
    const { images } = scene;

    if (state.blindfoldOn) {
        return sceneName === "quarto" && state.windowsCovered
            ? images.windowsCovered
            : images.blindfolded;
    }

    if (state.machineZoomActive && images.machineZoom) return images.machineZoom;

    return images.unblindfolded;
}

function renderScene(sceneName, imagePath) {
    state.currentScene = sceneName;

    const background = $("background");
    background.classList.remove("scene-enter");
    background.src = imagePath;
    void background.offsetWidth;
    background.classList.add("scene-enter");

    $("scene").classList.remove("hidden");
    $("interface").classList.remove("hidden");
    $("game").classList.toggle("blindfold-active", state.blindfoldOn);

    $("mirror-key-overlay").classList.toggle(
        "hidden",
        !(sceneName === "mirror" && !state.blindfoldOn && !state.keyCollected)
    );
}

export function loadScene(sceneName, onLoaded = null) {
    const scene = scenes[sceneName];
    if (!scene || state.isGameOver) return;

    const token = ++loadToken;
    const imagePath = resolveSceneImage(scene, sceneName);

    setLoading(true);
    $("scene-actions").replaceChildren();

    preloadImage(imagePath).then(() => {
        if (token !== loadToken) return;

        crtTransition(() => {
            if (token !== loadToken) return;

            renderScene(sceneName, imagePath);
            setLoading(false);
            renderSceneUI();

            if (onLoaded) onLoaded();
        });
    });
}

// Troca só a imagem de fundo do cenário atual (ex.: o agente nos portões)
export function swapBackground(imagePath, onReady = null) {
    const token = loadToken;

    preloadImage(imagePath).then(() => {
        if (token !== loadToken || state.isGameOver) return;
        $("background").src = imagePath;
        if (onReady) onReady();
    });
}
