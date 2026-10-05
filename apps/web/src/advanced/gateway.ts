import { selectedMode } from '../app/config'
import { fixture, type Advanced } from './model'
const key='pasarmalam:demo:advanced-v1'
function guard(){if(selectedMode()!=='fixture')throw new Error('Advanced fixtures are only available inside /demo')}
export function readAdvanced():Advanced{guard();try{const raw=localStorage.getItem(key);if(raw)return JSON.parse(raw) as Advanced}catch{/* Reset malformed local fixtures. */}return fixture()}
export function writeAdvanced(value:Advanced){guard();localStorage.setItem(key,JSON.stringify(value))}
export function resetAdvanced(){guard();localStorage.removeItem(key)}
