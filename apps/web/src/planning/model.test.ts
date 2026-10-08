import { describe,it,expect } from 'vitest'
import { chooseDish,conflicts,fixturePhoto } from './model'
describe('CP8 human review boundary',()=>{
 it('flags conflicting dish without preferring a source',()=>{expect(conflicts({dish:'Nasi lemak'},fixturePhoto)).toEqual(['dish']);expect(conflicts({dish:' chicken SATAY '},fixturePhoto)).toEqual([])})
 it('requires explicit confirmation',()=>{expect(()=>chooseDish({dish:'Nasi lemak'},fixturePhoto,'photo',false)).toThrow('Human confirmation')})
 it('keeps human source choice and never adds a safety field',()=>{expect(chooseDish({dish:'Nasi lemak'},fixturePhoto,'speech',true)).toEqual({dish:'Nasi lemak',source:'speech',confirmed:true});expect(chooseDish({dish:null},fixturePhoto,'photo',true).dish).toBe('Chicken satay')})
 it('unknown source needs manual input',()=>{expect(()=>chooseDish({dish:null},{...fixturePhoto,dish:null},'photo',true)).toThrow('manually')})
})
