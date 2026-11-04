import dialogueData from './dialogues.json' with { type: 'json' }

export const dialogues = Object.freeze(dialogueData)

export function getDialogue(id) {
  const dialogue = dialogues[id]
  if (!dialogue) throw new Error(`Diálogo não encontrado: ${id}`)
  return dialogue
}
