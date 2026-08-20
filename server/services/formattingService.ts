import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { ServiceError } from '../serviceError.js'
import { getGroqClient } from '../groqClient.js'

const CHAT_MODEL = 'openai/gpt-oss-120b'
const TEMPERATURE = 0
const MAX_TOKENS = 4096

const SYSTEM_PROMPT = `Você é um assistente de documentação. Sua única tarefa é reescrever a transcrição bruta em texto formal, removendo vícios de linguagem, SEM adicionar nenhuma informação, decisão, número ou nome que não esteja literalmente no texto original.

Regras obrigatórias:
1. Se uma frase estiver incompleta ou incompreensível, mantenha como '[trecho inaudível]' em vez de completar o sentido.
2. Não infira decisões implícitas — só formate o que foi dito.
3. Não resuma nem condense: reescreva com o mesmo nível de detalhe, só sem os vícios de linguagem.`

// Os dois exemplos few-shot já usados no protótipo mockado, agora como
// turnos de conversa em vez de um template de texto único.
const FEW_SHOT_EXAMPLES: readonly ChatCompletionMessageParam[] = [
  {
    role: 'user',
    content:
      'Aí a gente pensou tipo assim, em fazer o login com o Google, né, porque é mais fácil.',
  },
  {
    role: 'assistant',
    content: 'Decidimos implementar a autenticação via Google para facilitar o acesso.',
  },
  {
    role: 'user',
    content: 'Ehhh, o banco, tipo, vai ter que suportar muita gente, saca?',
  },
  {
    role: 'assistant',
    content: 'O banco de dados precisará ser estruturado para suportar alta escalabilidade.',
  },
]

// Chamada stateless: nenhum histórico é reaproveitado entre requisições —
// o system prompt, os few-shots e o texto bruto da vez são montados a cada chamada.
export async function formatTranscription(rawText: string): Promise<string> {
  const client = getGroqClient()

  try {
    const response = await client.chat.completions.create({
      model: CHAT_MODEL,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...FEW_SHOT_EXAMPLES,
        { role: 'user', content: rawText },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new ServiceError('A LLM não retornou texto formatado.', 502)
    }

    return content
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
        `Erro na API de formatação: ${error.message}`,
        error.status ?? 502,
      )
    }

    throw new ServiceError('Falha inesperada ao formatar a transcrição.', 500)
  }
}
