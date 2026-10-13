import pack from '../../../../contracts/cp9-showcase-pack.json'
import { download } from '../commerce/exports'
import { showcaseJSON } from './showcase'

export function ShowcasePack() {
  return <section className="panel">
    <h2>Student showcase preparation · CP9</h2>
    <p>Five-minute English storyboard and evidence checklist. Supplied rules are verified; actual student narration, independent user metrics and the complete backup recording remain pending. For a prototype walkthrough, show the clearly fictional integration and proof library. This pack does not certify competition eligibility.</p>
    <button className="button secondary" onClick={() => download(showcaseJSON(), 'pasarmalam-cp9-showcase-pack.json', 'application/json;charset=utf-8')}>Download CP9 showcase pack</button>
    <ol>{pack.chapters.map(chapter => <li key={chapter.id}>
      <strong>{Math.floor(chapter.start / 60)}:{String(chapter.start % 60).padStart(2, '0')}–{Math.floor(chapter.end / 60)}:{String(chapter.end % 60).padStart(2, '0')} · {chapter.title}</strong>
      <p>{chapter.check}</p>
      <details><summary>English narration and caption</summary><p>{chapter.narration}</p><p>{chapter.caption}</p></details>
    </li>)}</ol>
    <p>The expired scenario advances only fictional time. Scenario buttons replace the local demo workspace; keep the voice and batch-audit scenes together before resetting.</p>
  </section>
}
