export type ProcessingStage =
  | 'idle'
  | 'transcribing'
  | 'formatting'
  | 'done'
  | 'error'

export interface TranscriptionSession {
  fileName: string
  stage: ProcessingStage
  rawText: string
  formattedText: string
  errorMessage: string
}
