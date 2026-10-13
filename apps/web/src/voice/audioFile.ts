// Check the container signature because recorder exports may omit MIME and extensions.
export async function audioFile(file: Blob): Promise<Blob> {
 if (!file.size || file.size > 5_000_000) throw new Error('Only supply an audio file of at most 5 MB.')
 const bytes = new Uint8Array(await file.slice(0, 64).arrayBuffer())
 const at = (offset: number, value: string) => value.split('').every((c, i) => bytes[offset + i] === c.charCodeAt(0))
 let type = ''
 if (at(0, 'OggS')) type = 'audio/ogg'
 else if (at(0, 'RIFF') && at(8, 'WAVE')) type = 'audio/wav'
 else if (at(0, 'fLaC')) type = 'audio/flac'
 else if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) type = 'audio/webm'
 else if (at(4, 'ftyp')) type = 'audio/mp4'
 else if (at(0, 'ID3') || bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) type = 'audio/mpeg'
 if (!type) throw new Error('Unsupported audio format. Use Ogg, WAV, WebM, M4A, MP3 or FLAC.')
 return new Blob([file], { type })
}
