import { DemoImage } from './DemoImage'
import { batchImage, batchPhoto } from './demo-images'

export function BatchPhoto({food,number,foodId='',batchId='',photo}:{food:string;number:number;foodId?:string;batchId?:string;photo?:string|null}) {
 const fixture=/^\/(?:demo|sandbox)(?:\/|$)/.test(window.location.pathname)
 return <div className="batch-photo" data-batch-photo={batchId}><DemoImage image={fixture?batchImage(food,number,foodId):undefined} photo={photo??(fixture?batchPhoto(food,number,foodId,batchId):null)} description={fixture?`${food} · illustrative demo photo, not batch ${number}`:`${food} · batch ${number} preparation photo`}/></div>
}
