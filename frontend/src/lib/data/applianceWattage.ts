/**
 * Typical wattage by appliance (DOE Energy Saver reference, rounded).
 * Replace with a full dataset or move to backend once appliance-driven
 * consumption calcs go live.
 */
export const APPLIANCE_WATTAGE: Record<string, number> = {
  Refrigerator: 150,
  Freezer: 100,
  'Washing Machine': 500,
  'Clothes Dryer': 3000,
  Dishwasher: 1200,
  'Central Air Conditioner': 3500,
  'Window AC Unit': 1000,
  'Electric Oven': 2400,
  Microwave: 1000,
  Television: 100,
  'Desktop Computer': 200,
  Laptop: 50,
  'Water Heater': 4000,
  'Pool Pump': 1500,
  'EV Charger': 7000,
};

export const APPLIANCE_OPTIONS = Object.keys(APPLIANCE_WATTAGE);
