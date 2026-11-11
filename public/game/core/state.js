// ESTADO DO JOGO
// Objeto único compartilhado por todos os módulos. resetState() é usado
// tanto ao iniciar quanto ao reiniciar, evitando listas de reset duplicadas.
// (Os objetivos têm estado próprio em ui/objectives.js.)

function createInitialState() {
    return {
        currentScene: null,

        // Venda
        hasBlindfold: false,
        blindfoldOn: false,

        // Praia
        debrisExamined: false,
        machineZoomActive: false,

        // Portões e frente da casa
        gatesReady: false,
        warnings: 0, // advertências do Agente ao voltar aos portões
        toolsExamined: false,
        hasHammer: false,
        hasNails: false,

        // Quarto
        windowsCovered: false,
        pictureExamined: false,
        safeOpen: false,
        bookCollected: false,
        keyCollected: false,
        cabinetUnlocked: false,
        documentFound: false,
        bookRead: false,

        // Construção
        machineExamined: false,

        inventory: [],
        battery: 100,

        // Controle de fluxo
        isPaused: false,
        isGameOver: false,
        sceneLoading: false
    };
}

export const state = createInitialState();

export function resetState() {
    Object.assign(state, createInitialState());
}

// Campos de progresso gravados pelo "Salvar jogo"
export function getProgressSnapshot() {
    const { isPaused, isGameOver, sceneLoading, ...progress } = state;
    return { ...progress, inventory: [...state.inventory] };
}
