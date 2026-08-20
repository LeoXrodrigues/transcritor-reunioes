import './TranscriptionResult.css'

export interface TranscriptionResultProps {
  rawText: string
  formattedText: string
}

export function TranscriptionResult({
  rawText,
  formattedText,
}: TranscriptionResultProps) {
  const handleCopyFormattedText = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(formattedText)
    } catch (error) {
      console.error('Falha ao copiar o texto formatado:', error)
    }
  }

  const handleDownloadFormattedText = (): void => {
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'texto-formatado.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  return (
    <div className="transcription-result">
      <article className="transcription-column">
        <h2>Transcrição original</h2>
        <p className="transcription-text">{rawText}</p>
      </article>
      <article className="transcription-column transcription-column-formatted">
        <h2>Texto formatado</h2>
        <p className="transcription-text">{formattedText}</p>
        <div className="transcription-actions">
          <button type="button" onClick={handleCopyFormattedText}>
            Copiar texto formatado
          </button>
          <button type="button" onClick={handleDownloadFormattedText}>
            Baixar como .txt
          </button>
        </div>
      </article>
    </div>
  )
}
