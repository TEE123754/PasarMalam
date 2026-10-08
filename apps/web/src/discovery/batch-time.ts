export function malaysiaTime(value: string, language = 'en') {
  return new Intl.DateTimeFormat(language.startsWith('ms')?'ms-MY':'en-MY', {hour:'numeric', minute:'2-digit', timeZone:'Asia/Kuala_Lumpur'}).format(new Date(value))
}
export function countdown(deadline: string, now: Date) {
  const seconds = Math.max(0, Math.ceil((Date.parse(deadline)-now.getTime())/1000))
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`
}
