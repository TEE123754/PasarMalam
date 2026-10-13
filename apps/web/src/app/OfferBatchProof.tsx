import { DemoImage } from '../components/DemoImage'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
import type { DiscoverySnapshot } from '../data/types'

type Batch = DiscoverySnapshot['batches'][number]

export function OfferBatchProof({ batch, foodName }: { batch: Batch | undefined; foodName: string }) {
  const photoDescription = batch
    ? `Real batch photo for ${foodName}, batch ${batch.batchNumber}`
    : `Real batch photo unavailable for ${foodName}; no batch is linked to this offer`

  return (
    <div className={`clearance-batch-proof${batch ? '' : ' is-unlinked'}`}>
      <div className="clearance-proof-heading">
        {batch ? (
          <span className="clearance-proof-badge">✓ Exact batch shown</span>
        ) : (
          <span className="clearance-proof-badge is-unavailable">Batch details not linked</span>
        )}
        <figure className="clearance-proof-photo">
          <div className="clearance-proof-photo-frame">
            {batch?.photoUrl ? (
              <DemoImage photo={batch.photoUrl} description={photoDescription} />
            ) : (
              <ImagePlaceholder
                description={batch ? `Real batch photo unavailable for batch ${batch.batchNumber}` : photoDescription}
              />
            )}
            <span className="clearance-proof-photo-label">
              {batch?.photoUrl ? 'REAL BATCH PHOTO' : 'PHOTO UNAVAILABLE'}
            </span>
          </div>
        </figure>
      </div>
      <p className="clearance-proof-caption">
        {batch ? 'You see this exact batch — not a surprise bag' : 'Exact batch details are not linked to this offer yet.'}
      </p>
    </div>
  )
}
