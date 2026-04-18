/**
 * Hardcoded Google Solar API `buildingInsights:findClosest` response for a
 * Pasadena residence. Shape matches the real API so this object can be
 * fed to the same parser the production client will use.
 *
 * TEMPORARY: replaced by a real `solar-potential` Lambda call once backend ships.
 */
export const MOCK_GOOGLE_SOLAR_RESPONSE = {
  name: 'buildings/ChIJMockPasadena',
  center: { latitude: 34.1478, longitude: -118.1445 },
  imageryDate: { year: 2023, month: 6, day: 12 },
  postalCode: '91101',
  administrativeArea: 'CA',
  regionCode: 'US',
  imageryQuality: 'HIGH' as const,
  solarPotential: {
    maxArrayPanelsCount: 42,
    maxArrayAreaMeters2: 68.4,
    maxSunshineHoursPerYear: 2105.3,
    carbonOffsetFactorKgPerMwh: 428.9,
    panelCapacityWatts: 400,
    panelHeightMeters: 1.879,
    panelWidthMeters: 1.045,
    panelLifetimeYears: 20,
    solarPanelConfigs: [
      { panelsCount: 4, yearlyEnergyDcKwh: 2450.2 },
      { panelsCount: 8, yearlyEnergyDcKwh: 4880.6 },
      { panelsCount: 12, yearlyEnergyDcKwh: 7295.1 },
      { panelsCount: 16, yearlyEnergyDcKwh: 9690.3 },
      { panelsCount: 20, yearlyEnergyDcKwh: 12065.9 },
      { panelsCount: 24, yearlyEnergyDcKwh: 14420.4 },
      { panelsCount: 30, yearlyEnergyDcKwh: 17910.2 },
      { panelsCount: 36, yearlyEnergyDcKwh: 21358.7 },
      { panelsCount: 42, yearlyEnergyDcKwh: 25612.8 },
    ],
  },
};

/**
 * Hardcoded geocoding result for the same address.
 * TEMPORARY: replaced by an Amazon Location Service call once backend ships.
 */
export const MOCK_GEOCODE = {
  lat: 34.1476,
  lon: -118.1438,
  county: 'Los Angeles',
  formattedAddress: '100 N Garfield Ave, Pasadena, CA 91101',
};
