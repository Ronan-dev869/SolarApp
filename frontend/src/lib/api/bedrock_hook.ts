import { useState } from "react";
import { sendMessage } from "src/lib/api/bedrock";
import {fields} from "src/features/input-form/HouseholdForm";
import { useHouseholdStore } from '../../lib/store/household';
import {register} from "src/features/input-form/HouseholdForm";
function make_message(): string{
  const resolved = useHouseholdStore((s) => s.resolved);
  const { stats, solar, geocode } = resolved;

  const message: string = `Compare a household’s CO2 emissions and solar energy usage to typical averages for its surrounding small town/county.
      INPUT:
- Address: ${register('address')}

- Appliances (usage, kWh, hours, efficiency): ${fields}
- Solar system (kW, monthly kWh, storage): ${solarSystem}


  `;
  return message;
}
export function useChat(system = "You are a helpful assistant.") {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function send(userText) {
    const updated = [...messages, { role: "user", content: userText }];
    setMessages(updated);
    setLoading(true);
    setError(null);

    try {
      const data = await sendMessage(updated, system);
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return { messages, send, loading, error };
}