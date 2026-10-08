import { ui } from '../locales/phrases'
import { allergenCodes, type Allergens, type Declarations, unknownDeclarations } from './declarations'

const labels = { pork_free: 'Pork-free', alcohol_free: 'Alcohol-free', muslim_owned: 'Muslim-owned (voluntary statement)' }
const allergenLabels: Record<typeof allergenCodes[number], string> = { peanuts: 'Peanuts', 'tree-nuts': 'Tree nuts', milk: 'Milk', eggs: 'Eggs', soy: 'Soy', wheat: 'Wheat', fish: 'Fish', shellfish: 'Shellfish', sesame: 'Sesame', other: 'Other allergens — ask the hawker' }
function recorded(at?: string | null) { return at ? new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(at)) : null }
export function BusinessStatements({ value, at }: { value?: Declarations; at?: string | null }) {
  const declarations = value ?? unknownDeclarations
  return <section className="listing-statements"><h3>{ui('Hawker statements')}</h3><dl>{Object.entries(declarations).map(([key, statement]) => <div key={key}><dt>{ui(labels[key as keyof Declarations])}</dt><dd>{ui(statement === 'yes' ? 'Declared yes' : statement === 'no' ? 'Declared no' : 'Not declared')}</dd></div>)}</dl><p className="small muted">{ui('These voluntary statements are not halal certification. No identity is inferred.')}</p>{at && <p className="small">{ui('Recorded by the hawker')}: {recorded(at)}</p>}</section>
}
export function AllergenStatement({ value, at }: { value?: Allergens; at?: string | null }) {
  return <section className="listing-statements"><h4>{ui('Allergen information')}</h4>{value?.status === 'confirmed' ? <><p>{ui('Confirmed by the hawker')}: {value.contains.length ? value.contains.map(code => ui(allergenLabels[code])).join(', ') : ui('No allergens listed — this is not an allergen-free claim')}</p>{at && <p className="small">{ui('Last confirmed')}: {recorded(at)}</p>}</> : <p>{ui('Unknown — the hawker has not confirmed allergens')}</p>}<p className="small muted">{ui(value?.cross_contact === 'possible' ? 'Cross-contact possible. Ask the hawker before ordering.' : 'Cross-contact is unknown. This list may be incomplete; ask the hawker before ordering.')}</p></section>
}
export { labels, allergenLabels }
