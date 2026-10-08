const menuImages = {
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
const extraImages = {
 john:{file:'batch-john-1',alt:'Roti john at a Malaysian stall'},
 friedRice:{file:'batch-friedRice-1',alt:'Freshly wok-fried rice in a service tray'},
 apam:{file:'batch-apam-1',alt:'Apam jagung at a Malaysian stall'},
 tea:{file:'batch-tea-1',alt:'Chrysanthemum tea prepared at a drinks stall'},
 ubi:{file:'batch-ubi-1',alt:'Roasted sweet potatoes at a market stall'},
 tofu:{file:'batch-tofu-1',alt:'Crispy tofu in a service tray'},
 curry:{file:'batch-curry-1',alt:'Curry puffs in a service tray'},
 produce:{file:'batch-produce-1',alt:'Fresh vegetables packed at a farmers market'},
 community:{file:'market-community-pickup',alt:'Community surplus collection at a Malaysian market'},
 customerPortrait:{file:'person-customer',alt:'Fictional customer profile portrait'},
 hawkerPortrait:{file:'person-hawker',alt:'Fictional hawker profile portrait'},
} as const
export const batchDishes = ['satay','rice','cendol','pork','john','lime','kuih','friedRice','popia','apam','tea','ubi','banana','tofu','curry','produce'] as const
type BatchDish = typeof batchDishes[number]
type BatchImageKey = `${BatchDish}Batch${1|2|3}`
const batchImages = Object.fromEntries(batchDishes.flatMap(dish=>[1,2,3].map(variant=>[`${dish}Batch${variant}`,{file:`batch-${dish}-${variant}`,alt:`${dish} stall batch photograph, view ${variant}`}])) ) as Record<BatchImageKey,{file:string;alt:string}>
export const demoImages = {...menuImages,...extraImages,...batchImages}
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
 if(/roti john/.test(value))return 'john'
 if(/fried rice|nasi goreng/.test(value))return 'friedRice'
 if(/apam jagung|apam balik/.test(value))return 'apam'
 if(/teh bunga|chrysanthemum/.test(value))return 'tea'
 if(/ubi bakar|roasted sweet potato/.test(value))return 'ubi'
 if(/tauhu rangup|crispy tofu/.test(value))return 'tofu'
 if(/curry puff|karipap/.test(value))return 'curry'
 if(/seasonal vegetable|fresh produce/.test(value))return 'produce'
 return undefined
}
// Same batch always keeps its photo; another preparation advances to a different camera view.
export function batchImage(subject:string,number:number,foodId=''):DemoImageKey|undefined {
 const dish=foodImage(subject)
 if(!dish||!batchDishes.includes(dish as BatchDish))return undefined
 const size=/menu-2$/.test(foodId)||/· small/.test(subject)?1:/menu-3$/.test(foodId)||/· sharing/.test(subject)?2:0
 const variant=((Math.max(1,number)-1+size)%3)+1
 return `${dish}Batch${variant}` as BatchImageKey
}
export function batchPhoto(subject:string,number:number,foodId='',batchId=''):string|null {
 const image=batchImage(subject,number,foodId)
 return image?`/demo/images/${demoImages[image].file}.webp${batchId?`?batch=${encodeURIComponent(batchId)}`:''}`:null
}
export function contextualImage(description:string):DemoImageKey {
 return foodImage(description)??(/community|collection|pickup|collaboration|evidence/i.test(description)?'community':/morning|day market|farmers/i.test(description)?'day':/market|hero/i.test(description)?'night':'satayStall')
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
 if(/^FOOD-/.test(id)) {
  const n=Number(id.slice(5));const subjects=['satay','rice','cendol','pork','john','lime','kuih','friedRice','popia','apam','tea','ubi','banana','tofu'] as const
  return subjects[n<=14?n-1:8+(n-15)%6]
 }
 if(/^STALL-/.test(id))return Number(id.slice(6))%2?'satayStall':'riceStall'
 if(/^(?:PARTNER|EVIDENCE)-/.test(id))return 'community'
 if(/^AD-/.test(id))return 'satayStall'
 if(/^PERSONA-/.test(id))return Number(id.slice(8))%2?'customerPortrait':'hawkerPortrait'
 return undefined
}
