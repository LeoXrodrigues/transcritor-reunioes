import './TranscriptionResult.css'

export interface TranscriptionResultProps {
  rawText: string
  formattedText: string
}

export function TranscriptionResult({
  rawText,
  formattedText,
}: TranscriptionResultProps) {
  return (
    <div className="transcription-result">
      <article className="transcription-column">
        <h2>Transcrição original</h2>
        <p className="transcription-text">{rawText}</p>
      </article>
      <article className="transcription-column transcription-column-formatted">
        <h2>Texto formatado</h2>
        <p className="transcription-text">{formattedText}</p>
      </article>
    </div>
  )
}
