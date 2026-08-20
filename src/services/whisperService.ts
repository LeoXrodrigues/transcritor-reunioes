/**
 * Serviço mock que simula a chamada à API do Whisper (OpenAI) para
 * transcrição de áudio. Nenhuma requisição de rede é feita: o arquivo
 * é aceito apenas para simular o formato real de integração
 * (upload -> transcrição bruta).
 */

export interface WhisperTranscriptionResponse {
  text: string
}

const MOCK_RAW_TRANSCRIPTIONS: readonly string[] = [
  'Bom, eu acho que, tipo assim, a gente devia começar pela parte do login, né, ' +
    'porque ehh, tipo, é a primeira coisa que o usuário vai ver, saca? Aí a gente ' +
    'pensou tipo assim, em fazer o login com o Google, né, porque é mais fácil. ' +
    'E aí, tipo, depois disso a gente parte pro dashboard, que ainda tá, tipo, ' +
    'meio bagunçado, mas enfim.',
  'Então, ehh, sobre o banco de dados, tipo, a gente vai ter que pensar numa ' +
    'estrutura que aguenta bastante gente, né, porque tipo, se a Vitryne crescer ' +
    'rápido, tipo, o banco vai ter que suportar muita gente, saca? Aí eu acho ' +
    'que, tipo assim, o ideal seria já pensar em escalabilidade desde já, né.',
  'Ah, sobre o prazo, ehh, eu acho que, tipo, dá pra entregar até sexta, né, ' +
    'mas, tipo assim, só se a gente não mudar mais nada no escopo, saca? Porque ' +
    'aí, tipo, toda vez que muda alguma coisa, ehh, a gente acaba atrasando tudo, ' +
    'né, então bora tentar travar o escopo agora.',
]

function pickMockTranscription(file: File): string {
  const index = file.name.length % MOCK_RAW_TRANSCRIPTIONS.length
  return MOCK_RAW_TRANSCRIPTIONS[index]
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Simula o envio de um arquivo de áudio para a API do Whisper e o
 * recebimento da transcrição bruta, com os vícios de linguagem comuns
 * da fala (ex: "né", "tipo assim", "ehh").
 */
export async function transcribeAudio(
  file: File,
): Promise<WhisperTranscriptionResponse> {
  await delay(1800)
  return { text: pickMockTranscription(file) }
}
