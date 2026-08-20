import OpenAI from 'openai'
import { toFile } from 'openai/uploads'
import { ServiceError } from '../serviceError.js'
import { getGroqClient } from '../groqClient.js'

export interface RawTranscriptionResult {
  text: string
}

const WHISPER_MODEL = 'whisper-large-v3'
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024
const NO_SPEECH_PROB_THRESHOLD = 0.6
const INAUDIBLE_PLACEHOLDER = '[trecho inaudível]'

// Contexto fixo de vocabulário do domínio (nunca o conteúdo da reunião): ancora
// nomes e termos técnicos esperados para reduzir alucinação do Whisper.
const DOMAIN_VOCABULARY_PROMPT =
  'Reunião do projeto Vitryne, e-commerce de moda. Termos comuns: Spring Boot, ' +
  'endpoint, sprint, backlog, PR, deploy.'

interface GroqTranscriptionSegment {
  text: string
  no_speech_prob: number
}

interface GroqVerboseTranscription {
  text: string
  segments?: GroqTranscriptionSegment[]
}

function isGroqVerboseTranscription(value: unknown): value is GroqVerboseTranscription {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { text: unknown }).text === 'string'
  )
}

// Substitui segments com alta probabilidade de silêncio/ruído por um marcador
// explícito, em vez de manter texto alucinado pelo Whisper como se fosse fala real.
function reduceToInaudibleAwareText(transcription: GroqVerboseTranscription): string {
  if (!transcription.segments || transcription.segments.length === 0) {
    return transcription.text.trim()
  }

  return transcription.segments
    .map((segment) =>
      segment.no_speech_prob > NO_SPEECH_PROB_THRESHOLD
        ? INAUDIBLE_PLACEHOLDER
        : segment.text.trim(),
    )
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export async function transcribeAudio(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<RawTranscriptionResult> {
  if (fileBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new ServiceError(
      'O arquivo de áudio excede o limite de 25MB aceito pela API da Groq.',
      413,
    )
  }

  const client = getGroqClient()

  try {
    const file = await toFile(fileBuffer, fileName, { type: mimeType })
    const response = await client.audio.transcriptions.create({
      file,
      model: WHISPER_MODEL,
      language: 'pt',
      temperature: 0,
      response_format: 'verbose_json',
      prompt: DOMAIN_VOCABULARY_PROMPT,
    })

    if (!isGroqVerboseTranscription(response)) {
      throw new ServiceError('Resposta inesperada da API de transcrição.', 502)
    }

    return { text: reduceToInaudibleAwareText(response) }
  } catch (error) {
    if (error instanceof ServiceError) throw error

    if (error instanceof OpenAI.AuthenticationError) {
      throw new ServiceError('Chave de API da Groq inválida ou expirada.', 401)
    }
    if (error instanceof OpenAI.RateLimitError) {
      throw new ServiceError(
        'Limite de requisições da Groq atingido. Tente novamente em instantes.',
        429,
      )
    }
    if (error instanceof OpenAI.APIError) {
      throw new ServiceError(
        `Erro na API de transcrição: ${error.message}`,
        error.status ?? 502,
      )
    }

    throw new ServiceError('Falha inesperada ao transcrever o áudio.', 500)
  }
}
