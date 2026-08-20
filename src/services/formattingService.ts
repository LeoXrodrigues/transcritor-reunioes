/**
 * Serviço mock que simula o envio da transcrição bruta para uma LLM
 * responsável por formatar o texto em uma ata de reunião fluida e
 * formal, usando a técnica de Few-Shot Prompting.
 */

const FEW_SHOT_PROMPT_TEMPLATE = `Você é um assistente de documentação. Transforme a transcrição bruta da reunião em um texto fluido, formal e sem vícios de linguagem. Não altere o sentido da frase.
Exemplo 1:
Original: "Aí a gente pensou tipo assim, em fazer o login com o Google, né, porque é mais fácil."
Formatado: "Decidimos implementar a autenticação via Google para facilitar o acesso."

Exemplo 2:
Original: "Ehhh, o banco, tipo, vai ter que suportar muita gente, saca?"
Formatado: "O banco de dados precisará ser estruturado para suportar alta escalabilidade."

Texto Original: [TEXTO_BRUTO_AQUI]`

/**
 * Monta o prompt final que seria enviado à LLM, injetando a
 * transcrição bruta no placeholder do template few-shot.
 */
export function buildFormattingPrompt(rawText: string): string {
  return FEW_SHOT_PROMPT_TEMPLATE.replace('[TEXTO_BRUTO_AQUI]', rawText)
}

// Pares conhecidos (raw -> formatado) usados para simular respostas
// realistas da LLM para as amostras mockadas do whisperService.
const MOCK_FORMATTED_RESPONSES: ReadonlyMap<string, string> = new Map([
  [
    'login',
    'Decidimos iniciar pela tela de login, por ser o primeiro ponto de ' +
      'contato do usuário com o sistema. Ficou definido que a autenticação ' +
      'será feita via Google, por oferecer maior facilidade de acesso. Em ' +
      'seguida, o time seguirá para o dashboard, que ainda está em fase de ' +
      'organização.',
  ],
  [
    'banco',
    'Foi discutida a estrutura do banco de dados, com a necessidade de ' +
      'suportar um alto volume de usuários caso a Vitryne apresente ' +
      'crescimento acelerado. Ficou definido que a escalabilidade deve ser ' +
      'considerada desde já no planejamento da arquitetura.',
  ],
  [
    'prazo',
    'Em relação ao prazo, a entrega está prevista para sexta-feira, desde ' +
      'que não haja novas alterações de escopo. O time destacou que ' +
      'mudanças recorrentes de escopo têm gerado atrasos, e propôs travar ' +
      'o escopo atual para garantir o cumprimento do prazo.',
  ],
])

function fallbackCleanup(rawText: string): string {
  const fillerWordsPattern =
    /\b(tipo assim|tipo|né|ehh+|saca|então\b|aí\b)\b[,.]?\s*/gi
  const cleaned = rawText.replace(fillerWordsPattern, ' ').replace(/\s{2,}/g, ' ').trim()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Simula o envio do prompt few-shot para uma LLM e o recebimento do
 * texto formatado, pronto para compor a ata de reunião.
 */
export async function formatTranscription(rawText: string): Promise<string> {
  const prompt = buildFormattingPrompt(rawText)
  void prompt // representa o payload que seria enviado à LLM real

  await delay(1500)

  const matchedKey = [...MOCK_FORMATTED_RESPONSES.keys()].find((key) =>
    rawText.toLowerCase().includes(key),
  )

  return matchedKey
    ? MOCK_FORMATTED_RESPONSES.get(matchedKey)!
    : fallbackCleanup(rawText)
}
