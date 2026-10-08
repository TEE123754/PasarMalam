import pack from '../../../../contracts/cp9-showcase-pack.json'

// ASCII JSON escapes preserve captions through download clients with mixed encodings.
export function showcaseJSON() {
  return JSON.stringify(pack, null, 2).replace(/[\u0080-\uffff]/g, value =>
    `\\u${value.charCodeAt(0).toString(16).padStart(4, '0')}`)
}
