/**
 * Cliente HTTP para o endpoint de formatação de texto exposto pelo
 * backend local (server/), que por sua vez chama a API da Groq
 * (chat completions). A chave de API nunca é exposta ao navegador.
 */

interface FormatTranscriptionResponse {
  formattedText: string
}

function isFormatTranscriptionResponse(
  value: unknown,
): value is FormatTranscriptionResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { formattedText: unknown }).formattedText === 'string'
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
  return 'Não foi possível formatar a transcrição. Tente novamente.'
}

export async function formatTranscription(rawText: string): Promise<string> {
  const response = await fetch('/api/format', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  const data: unknown = await response.json()
  if (!isFormatTranscriptionResponse(data)) {
    throw new Error('Resposta inesperada do servidor de formatação.')
  }

  return data.formattedText
}
