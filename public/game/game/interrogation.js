// INTERROGATÓRIO DO AGENTE
// Na 3ª advertência O Agente desconfia e faz perguntas em sequência
// (data/dialogues.json, "officerInterrogation"). Qualquer resposta suspeita
// elimina o MEE; passar por todas libera o jogador uma última vez.
import { getDialogue } from "../data/dialogues.js";
import { showDialogue, showChoiceDialogue } from "../ui/dialogue.js";
import { gameOver } from "./flow.js";

const AGENT = "O AGENTE";
export const AGENT_GAME_OVER_MESSAGE = "O Agente não acreditou em você.";

const say = (lines) => new Promise(resolve => showDialogue(lines, resolve, AGENT));

const ask = (question) => new Promise(resolve => {
    showChoiceDialogue(question.question, question.answers.map(answer => ({
        label: answer.label,
        action: () => resolve(answer)
    })), AGENT);
});

// Fala final do Agente e game over
export async function eliminatePlayer(lines, message = AGENT_GAME_OVER_MESSAGE) {
    await say(lines);
    gameOver(message);
}

// onReleased é chamado se o jogador passar por todas as perguntas
export async function startInterrogation(onReleased) {
    const interrogation = getDialogue("officerInterrogation");

    await say(interrogation.intro);

    for (const question of interrogation.questions) {
        const answer = await ask(question);
        if (answer.reply) await say([answer.reply]);

        if (answer.suspicious) {
            await eliminatePlayer(interrogation.rejection);
            return;
        }
    }

    await say(interrogation.release);
    onReleased?.();
}
