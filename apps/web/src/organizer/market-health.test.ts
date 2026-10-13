import { describe, expect, it } from 'vitest'
import { pilotTotals } from '../presentation/model'
import { buildDemoMarketHealthReport, percentChange } from './market-health'

describe('demo organizer market health report', () => {
  it('reuses the four-week market pilot diversion and net-recovery calculations', () => {
    const report = buildDemoMarketHealthReport(new Date('2026-10-13T12:00:00Z'))
    const weeks = [1, 2, 3, 4].map(pilotTotals)
    const expectedWaste = weeks.reduce((total, week) => total + week.humanKg + week.estimatedHumanKg + week.compostKg + week.bsfKg, 0)
    const expectedNet = weeks.reduce((total, week) => total + week.net, 0)
    expect(report.marketName).toContain('Seri Pelita')
    expect(report.foodDivertedKg).toBe(Math.round(expectedWaste * 10) / 10)
    expect(report.netRecoverySen).toBe(expectedNet)
    expect(report.participatingStalls).toBeGreaterThan(0)
    expect(report.reportingSessions).toBeLessThanOrEqual(report.scheduledSessions)
  })

  it('provides six-month trend series whose current point agrees with the headline metrics', () => {
    const report = buildDemoMarketHealthReport(new Date('2026-10-13T12:00:00Z'))
    expect(report.months).toHaveLength(6)
    expect(report.divertedTrendKg).toHaveLength(6)
    expect(report.recoveryTrendRm).toHaveLength(6)
    expect(report.divertedTrendKg.at(-1)).toBe(report.foodDivertedKg)
    expect(report.recoveryTrendRm.at(-1)).toBe(Math.round(report.netRecoverySen) / 100)
    expect(percentChange([100, 120])).toBe(20)
  })
})
