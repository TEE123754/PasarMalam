import { DemoImage } from '../components/DemoImage'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
import type { DiscoverySnapshot } from '../data/types'
import { selectedMode } from './config'

type Batch = DiscoverySnapshot['batches'][number]

export function OfferBatchProof({ batch, foodName }: { batch: Batch | undefined; foodName: string }) {
  // Demo photos are illustrative fixture artwork; only a connected hawker upload is a recorded batch photo (DESIGN.md)
  const illustrative = selectedMode() === 'fixture'
  const photoDescription = batch
    ? illustrative ? `Illustrative demo photo of ${foodName}; not a photo of batch ${batch.batchNumber}` : `Hawker-uploaded photo of ${foodName}, batch ${batch.batchNumber}`
    : `Batch photo unavailable for ${foodName}; no batch is linked to this offer`

  return (
    <div className={`clearance-batch-proof${batch ? '' : ' is-unlinked'}`}>
      <div className="clearance-proof-heading">
        {batch ? (
          <span className="clearance-proof-badge">✓ Linked to batch #{batch.batchNumber}</span>
        ) : (
          <span className="clearance-proof-badge is-unavailable">Batch details not linked</span>
        )}
        <figure className="clearance-proof-photo">
          <div className="clearance-proof-photo-frame">
            {batch?.photoUrl ? (
              <DemoImage photo={batch.photoUrl} description={photoDescription} />
            ) : (
              <ImagePlaceholder
                description={batch ? `No photo recorded for batch ${batch.batchNumber}` : photoDescription}
              />
            )}
            <span className="clearance-proof-photo-label">
              {batch?.photoUrl ? illustrative ? 'Illustrative demo photo' : 'Hawker’s batch photo' : 'No photo recorded'}
            </span>
          </div>
        </figure>
      </div>
      <p className="clearance-proof-caption">
        {batch ? 'You reserve from this recorded batch, not a surprise bag.' : 'Batch details are not linked to this offer yet.'}
      </p>
    </div>
  )
}
