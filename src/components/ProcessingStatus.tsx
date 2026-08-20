import type { ProcessingStage } from '../types/transcription'
import './ProcessingStatus.css'

export interface ProcessingStatusProps {
  stage: ProcessingStage
  fileName: string
  errorMessage: string
}

const STAGE_LABELS: Record<ProcessingStage, string> = {
  idle: '',
  transcribing: 'Transcrevendo áudio com o Whisper...',
  formatting: 'Formatando a ata com a LLM...',
  done: 'Concluído',
  error: 'Ocorreu um erro',
}

export function ProcessingStatus({
  stage,
  fileName,
  errorMessage,
}: ProcessingStatusProps) {
  if (stage === 'idle') return null

  if (stage === 'error') {
    return (
      <p className="processing-status processing-status-error" role="alert">
        {errorMessage || STAGE_LABELS.error}
      </p>
    )
  }

  return (
    <p className="processing-status">
      <span className="processing-status-file">{fileName}</span>
      {' — '}
      {STAGE_LABELS[stage]}
    </p>
  )
}
