const dialogueUrl = new URL('./dialogues.json', import.meta.url)
const dialogueData = await fetch(dialogueUrl).then((response) => {
  if (!response.ok) throw new Error(`Falha ao carregar diálogos: ${response.status}`)
  return response.json()
})

export const dialogues = Object.freeze(dialogueData)

export function getDialogue(id) {
  const dialogue = dialogues[id]
  if (!dialogue) throw new Error(`Diálogo não encontrado: ${id}`)
  return dialogue
}
