import manifest from '../../../../contracts/speech-model.json'
export type SpeechLanguage = 'ms' | 'en' | 'mixed'
export type SpeechModelId = 'tiny' | 'small' | 'turbo' | 'desktop'
export function speechProfile(id: SpeechModelId) {
 return manifest.profiles.find(profile => profile.id === id) ?? manifest.profiles[0]
}
export function speechOptions(language: SpeechLanguage) {
 return { language: language === 'mixed' ? 'ms' : language, task: 'transcribe' as const, return_timestamps: false as const, chunk_length_s: 30, max_new_tokens: 256, do_sample: false }
}
