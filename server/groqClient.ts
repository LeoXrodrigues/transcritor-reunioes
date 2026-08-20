import OpenAI from 'openai'
import { ServiceError } from './serviceError.js'

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

// Client OpenAI-compatível apontado para a Groq, compartilhado pelos
// serviços de transcrição (áudio) e formatação (texto) — mesma
// GROQ_API_KEY, único provider pago do projeto (free tier).
export function getGroqClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new ServiceError(
      'Chave de API da Groq (GROQ_API_KEY) não configurada no servidor.',
      500,
    )
  }
  return new OpenAI({ baseURL: GROQ_BASE_URL, apiKey })
}
