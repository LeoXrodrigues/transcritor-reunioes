import { useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import './AudioDropzone.css'

export interface AudioDropzoneProps {
  onFileAccepted: (file: File) => void
  disabled: boolean
}

const ACCEPTED_EXTENSION = '.mp3'
const ACCEPTED_MIME_TYPES: readonly string[] = ['audio/mpeg', 'audio/mp3']

function isMp3File(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith(ACCEPTED_EXTENSION) ||
    ACCEPTED_MIME_TYPES.includes(file.type)
  )
}

export function AudioDropzone({ onFileAccepted, disabled }: AudioDropzoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [rejectionMessage, setRejectionMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File | undefined): void {
    if (!file) return

    if (!isMp3File(file)) {
      setRejectionMessage('Apenas arquivos .mp3 são aceitos.')
      return
    }

    setRejectionMessage('')
    onFileAccepted(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    setIsDraggingOver(false)
    if (disabled) return
    handleFile(event.dataTransfer.files[0])
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    if (disabled) return
    setIsDraggingOver(true)
  }

  function handleDragLeave(): void {
    setIsDraggingOver(false)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    handleFile(event.target.files?.[0])
    event.target.value = ''
  }

  function handleClick(): void {
    if (disabled) return
    inputRef.current?.click()
  }

  return (
    <div className="audio-dropzone-wrapper">
      <div
        className={`audio-dropzone${isDraggingOver ? ' is-dragging' : ''}${
          disabled ? ' is-disabled' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        <p className="audio-dropzone-title">
          Arraste um arquivo .mp3 aqui ou clique para selecionar
        </p>
        <p className="audio-dropzone-subtitle">
          A gravação será transcrita e formatada automaticamente
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,.mp3"
          onChange={handleInputChange}
          disabled={disabled}
          className="audio-dropzone-input"
        />
      </div>
      {rejectionMessage && (
        <p className="audio-dropzone-error" role="alert">
          {rejectionMessage}
        </p>
      )}
    </div>
  )
}
