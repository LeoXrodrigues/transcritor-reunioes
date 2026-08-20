import { useState } from 'react'
import { AudioDropzone } from './AudioDropzone'
import { ProcessingStatus } from './ProcessingStatus'
import { TranscriptionResult } from './TranscriptionResult'
import { transcribeAudio } from '../services/whisperService'
import { formatTranscription } from '../services/formattingService'
import type { TranscriptionSession } from '../types/transcription'
import './TranscriptionWorkspace.css'

const INITIAL_SESSION: TranscriptionSession = {
  fileName: '',
  stage: 'idle',
  rawText: '',
  formattedText: '',
  errorMessage: '',
}

export function TranscriptionWorkspace() {
  const [session, setSession] = useState<TranscriptionSession>(INITIAL_SESSION)

  const isProcessing =
    session.stage === 'transcribing' || session.stage === 'formatting'

  async function handleFileAccepted(file: File): Promise<void> {
    setSession({
      fileName: file.name,
      stage: 'transcribing',
      rawText: '',
      formattedText: '',
      errorMessage: '',
    })

    try {
      const { text: rawText } = await transcribeAudio(file)
      setSession((current) => ({ ...current, stage: 'formatting', rawText }))

      const formattedText = await formatTranscription(rawText)
      setSession((current) => ({ ...current, stage: 'done', formattedText }))
    } catch {
      setSession((current) => ({
        ...current,
        stage: 'error',
        errorMessage: 'Não foi possível processar o áudio. Tente novamente.',
      }))
    }
  }

  return (
    <section className="transcription-workspace">
      <header className="transcription-workspace-header">
        <h1>Transcritor de reuniões — Vitryne</h1>
        <p>Envie o áudio de uma reunião e receba a ata já formatada.</p>
      </header>

      <AudioDropzone onFileAccepted={handleFileAccepted} disabled={isProcessing} />

      <ProcessingStatus
        stage={session.stage}
        fileName={session.fileName}
        errorMessage={session.errorMessage}
      />

      {session.stage === 'done' && (
        <TranscriptionResult
          rawText={session.rawText}
          formattedText={session.formattedText}
        />
      )}
    </section>
  )
}
