import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  householdInputSchema,
  DEFAULT_FORM_VALUES,
  APPLIANCE_NAME_OPTIONS,
  type HouseholdFormValues,
} from './schema';
import { resolveHousehold } from '../../lib/api/resolveHousehold';
import { useHouseholdStore } from '../../lib/store/household';

export function HouseholdForm() {
  const setResolved = useHouseholdStore((s) => s.setResolved);
  const setLoading = useHouseholdStore((s) => s.setLoading);
  const setError = useHouseholdStore((s) => s.setError);
  const isLoading = useHouseholdStore((s) => s.isLoading);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<HouseholdFormValues>({
    resolver: zodResolver(householdInputSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'appliances',
  });

  const onSubmit = async (values: HouseholdFormValues) => {
    setLoading(true);
    try {
      const resolved = await resolveHousehold(values);
      setResolved(resolved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Your household</h1>
      <h2>Tell us about your home</h2>

      <div className="form-field">
        <label htmlFor="address">Address</label>
        <input id="address" type="text" {...register('address')} />
        {errors.address && (
          <div className="field-error">{errors.address.message}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="annualConsumptionKwh">Annual consumption (kWh)</label>
          <input
            id="annualConsumptionKwh"
            type="number"
            step="1"
            {...register('annualConsumptionKwh')}
          />
          {errors.annualConsumptionKwh && (
            <div className="field-error">
              {errors.annualConsumptionKwh.message}
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="panelCount">Solar panels</label>
          <input
            id="panelCount"
            type="number"
            step="1"
            {...register('panelCount')}
          />
          {errors.panelCount && (
            <div className="field-error">{errors.panelCount.message}</div>
          )}
        </div>
      </div>

      <label>Appliances</label>
      {fields.map((field, i) => (
        <div className="appliance-row" key={field.id}>
          <div>
            <select {...register(`appliances.${i}.name` as const)}>
              {APPLIANCE_NAME_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="number"
              step="0.5"
              placeholder="hrs/day"
              {...register(`appliances.${i}.hoursPerDay` as const)}
            />
          </div>
          <button type="button" onClick={() => remove(i)} aria-label="Remove">
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn-add"
        onClick={() =>
          append({ name: APPLIANCE_NAME_OPTIONS[0], count: 1, hoursPerDay: 4 })
        }
      >
        + Add appliance
      </button>

      <button type="submit" disabled={isLoading} style={{ width: '100%' }}>
        {isLoading ? 'Calculating…' : 'Calculate'}
      </button>
    </form>
  );
}
