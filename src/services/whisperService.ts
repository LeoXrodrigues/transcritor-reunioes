/**
 * Cliente HTTP para o endpoint de transcrição de áudio exposto pelo
 * backend local (server/), que por sua vez chama a API da Groq
 * (Whisper). A chave de API nunca é exposta ao navegador.
 */

export interface WhisperTranscriptionResponse {
  text: string
}

function isWhisperTranscriptionResponse(
  value: unknown,
): value is WhisperTranscriptionResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { text: unknown }).text === 'string'
  )
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()
    if (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as { error: unknown }).error === 'string'
    ) {
      return (data as { error: string }).error
    }
  } catch {
    // resposta sem corpo JSON válido — cai na mensagem genérica abaixo
  }
  return 'Não foi possível transcrever o áudio. Tente novamente.'
}

export async function transcribeAudio(file: File): Promise<WhisperTranscriptionResponse> {
  const formData = new FormData()
  formData.append('audio', file)

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  const data: unknown = await response.json()
  if (!isWhisperTranscriptionResponse(data)) {
    throw new Error('Resposta inesperada do servidor de transcrição.')
  }

  return data
}
