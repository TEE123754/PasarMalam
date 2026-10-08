import vectors from '../../../../contracts/cp5-accounting-vectors.json'
import { describe, expect, it } from 'vitest'
import { recommendation, type Raw } from './model'
describe('CP5 shared Python/TypeScript vectors',()=>{for(const c of vectors.cases)it(`ETA ${c.eta}`,()=>expect(recommendation(vectors.raw as Raw,'b',c.eta)).toMatchObject(c.expected))})
