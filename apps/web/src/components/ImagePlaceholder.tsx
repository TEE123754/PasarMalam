import { ui } from '../locales/phrases'
export function ImagePlaceholder({description,assetId}:{description:string;assetId?:string}) {
  return <div data-asset-id={assetId} className="image-placeholder" role="img" aria-label={`${ui('Image placeholder')}: ${description}`}><span>{description}</span></div>
}

