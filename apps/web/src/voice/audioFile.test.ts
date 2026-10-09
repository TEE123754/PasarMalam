import { expect, it } from 'vitest'
import { audioFile } from './audioFile'

it('accepts an extensionless Ogg recording without trusting its MIME', async () => {
 const source = new Blob(['OggS', new Uint8Array(100)], { type: 'application/octet-stream' })
 const result = await audioFile(source)
 expect(result.type).toBe('audio/ogg')
 expect(await result.arrayBuffer()).toEqual(await source.arrayBuffer())
})
it('rejects non-audio content even when labelled audio', async () => {
 await expect(audioFile(new Blob(['<html>fake</html>'], { type: 'audio/ogg' }))).rejects.toThrow('Unsupported')
})
it('rejects empty and oversized recordings before reading them', async () => {
 await expect(audioFile(new Blob([]))).rejects.toThrow('5 MB')
 await expect(audioFile(new Blob([new Uint8Array(5_000_001)]))).rejects.toThrow('5 MB')
})
