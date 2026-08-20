import 'dotenv/config'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { transcribeAudio } from './services/whisperService.js'
import { formatTranscription } from './services/formattingService.js'
import { ServiceError } from './serviceError.js'

const PORT = Number(process.env.PORT) || 8787
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

const app = express()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
})

app.use(express.json())

function extractRawText(body: unknown): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as { rawText: unknown }).rawText === 'string'
  ) {
    return (body as { rawText: string }).rawText
  }
  return ''
}

app.post(
  '/api/transcribe',
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new ServiceError('Nenhum arquivo de áudio foi enviado.', 400)
      }
      const result = await transcribeAudio(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
      )
      res.json(result)
    } catch (error) {
      next(error)
    }
  },
)

app.post('/api/format', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawText = extractRawText(req.body as unknown)
    if (!rawText.trim()) {
      throw new ServiceError('Nenhum texto bruto foi enviado para formatação.', 400)
    }
    const formattedText = await formatTranscription(rawText)
    res.json({ formattedText })
  } catch (error) {
    next(error)
  }
})

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ServiceError) {
    res.status(error.statusCode).json({ error: error.message })
    return
  }
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ error: 'O arquivo de áudio excede o limite de 25MB.' })
    return
  }
  console.error(error)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

app.listen(PORT, () => {
  console.log(`Servidor de transcrição rodando em http://localhost:${PORT}`)
})
