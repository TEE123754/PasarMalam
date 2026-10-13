import catalog from '../../../../contracts/demo-catalog.json'
import { pilotTotals } from '../presentation/model'

const MARKET_ID = 'seri-pelita'
const WEEKS = [1, 2, 3, 4]
const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']

export interface MarketHealthReportData {
  marketId: string
  marketName: string
  generatedAt: Date
  participatingStalls: number
  foodDivertedKg: number
  netRecoverySen: number
  customerVisitsPerWeek: number
  reportingSessions: number
  scheduledSessions: number
  months: string[]
  divertedTrendKg: number[]
  recoveryTrendRm: number[]
  visitTrend: number[]
}

export function buildDemoMarketHealthReport(generatedAt: Date): MarketHealthReportData {
  const market = catalog.discovery.markets.find(item => item.id === MARKET_ID)
  const scheduled = catalog.pilot.filter(row => row.market === MARKET_ID)
  const participating = WEEKS.flatMap(week => pilotTotals(week).rows.filter(row => row.market === MARKET_ID))
  const uniqueHawkers = new Set(participating.map(row => row.stall))
  const sum = (rows: typeof participating, selector: (row: (typeof participating)[number]) => number) => rows.reduce((total, row) => total + selector(row), 0)
  const foodDivertedKg = sum(participating, row => row.weighedHumanGrams + row.estimatedHumanGrams + row.compostGrams + row.bsfGrams) / 1000
  const netRecoverySen = sum(participating, row => row.grossSen - row.refundSen - row.commissionSen - row.incrementalSen)
  const foodDivertedKgRounded = Math.round(foodDivertedKg * 10) / 10
  const netRecoveryRm = Math.round(netRecoverySen) / 100

  return {
    marketId: MARKET_ID,
    marketName: market?.name ?? 'Seri Pelita Night Market',
    generatedAt: new Date(generatedAt),
    participatingStalls: uniqueHawkers.size,
    foodDivertedKg: foodDivertedKgRounded,
    netRecoverySen,
    customerVisitsPerWeek: 2840,
    reportingSessions: participating.length,
    scheduledSessions: scheduled.length,
    months: [...MONTHS],
    divertedTrendKg: [39.2, 45.8, 53.1, 59.4, 66.2, foodDivertedKgRounded],
    recoveryTrendRm: [320, 366, 421, 492, 556, netRecoveryRm],
    visitTrend: [2260, 2370, 2490, 2610, 2740, 2840],
  }
}

export function percentChange(values: number[]): number {
  if (values.length < 2 || values[0] === 0) return 0
  return Math.round(((values[values.length - 1] - values[0]) / Math.abs(values[0])) * 100)
}
