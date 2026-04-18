export function pctOfTotal(householdValue: number, countyTotal: number): number {
  if (countyTotal <= 0) return 0;
  return (householdValue / countyTotal) * 100;
}
