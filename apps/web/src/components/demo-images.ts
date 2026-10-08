export const demoImages = {
 night: {file:'pm-01-night-market',alt:'Illustrated Malaysian night market at dusk'},
 day: {file:'pm-02-day-market',alt:'Illustrated Malaysian morning market'},
 satayStall: {file:'pm-03-satay-stall',alt:'Malaysian satay stall'},
 riceStall: {file:'pm-04-nasi-lemak-stall',alt:'Malaysian nasi lemak stall'},
 satay: {file:'pm-05-chicken-satay',alt:'Chicken satay with peanut sauce'},
 rice: {file:'pm-06-nasi-lemak',alt:'Nasi lemak with chicken, egg and sambal'},
 cendol: {file:'pm-07-cendol',alt:'Cendol with coconut milk and palm sugar'},
 pork: {file:'pm-08-pork-noodles',alt:'Pork noodle soup; representative non-halal dish'},
 lime: {file:'pm-09-lime-drink',alt:'Lime drink with ice'},
 kuih: {file:'pm-10-kuih-talam',alt:'Green and white kuih talam'},
 popia: {file:'pm-11-vegetable-popia',alt:'Vegetable popia with dipping sauce'},
 banana: {file:'pm-12-pisang-goreng',alt:'Golden banana fritters'},
} as const
export type DemoImageKey = keyof typeof demoImages
export function foodImage(subject:string):DemoImageKey|undefined {
 const value=subject.toLowerCase()
 if(/pork|babi/.test(value))return /noodle|mi|mee/.test(value)?'pork':undefined
 if(/chicken satay|satay ayam|sate ayam/.test(value))return 'satay'
 if(/nasi lemak/.test(value))return 'rice'
 if(/cendol/.test(value))return 'cendol'
 if(/lime|limau/.test(value))return 'lime'
 if(/kuih talam/.test(value))return 'kuih'
 if(/popia|popiah/.test(value)&&/sayur|vegetable/.test(value))return 'popia'
 if(/pisang goreng|banana fritter/.test(value))return 'banana'
 return undefined
}
export function assetImage(id:string):DemoImageKey|undefined {
 if(id==='HERO-01'||/^MARKET-0[1-6]$/.test(id))return 'night'
 if(/^MARKET-(?:0[7-9]|10)$/.test(id))return 'day'
 if(id==='HERO-02'||id==='STALL-01')return 'satayStall'
 if(id==='STALL-02')return 'riceStall'
 const unique:Record<string,DemoImageKey>={'FOOD-01':'satay','FOOD-02':'rice','FOOD-03':'cendol','FOOD-04':'pork','FOOD-06':'lime','FOOD-07':'kuih'}
 if(unique[id])return unique[id]
 if(['FOOD-09','FOOD-15','FOOD-21','FOOD-27'].includes(id))return 'popia'
 if(['FOOD-13','FOOD-19','FOOD-25'].includes(id))return 'banana'
 return undefined
}
