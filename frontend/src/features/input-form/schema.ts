import { z } from 'zod';
import { APPLIANCE_OPTIONS } from '../../lib/data/applianceWattage';

export const applianceEntrySchema = z.object({
  name: z.string().min(1, 'Pick an appliance'),
  count: z.coerce.number().int().min(1).max(50),
  hoursPerDay: z.coerce.number().min(0).max(24),
});

export const householdInputSchema = z.object({
  address: z.string().min(3, 'Enter an address'),
  annualConsumptionKwh: z.coerce
    .number()
    .positive('Must be positive')
    .max(200_000, 'Too high'),
  panelCount: z.coerce.number().int().min(0).max(200),
  appliances: z.array(applianceEntrySchema),
});

export type HouseholdFormValues = z.infer<typeof householdInputSchema>;

export const DEFAULT_FORM_VALUES: HouseholdFormValues = {
  address: '1234 Sunny Lane, Pasadena, CA 91101',
  annualConsumptionKwh: 9600,
  panelCount: 16,
  appliances: [
    { name: 'Refrigerator', count: 1, hoursPerDay: 24 },
    { name: 'Central Air Conditioner', count: 1, hoursPerDay: 6 },
  ],
};

export const APPLIANCE_NAME_OPTIONS = APPLIANCE_OPTIONS;
