const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
export async function sendMessage(messages: any[], system?: string) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system })
  });

  if (!res.ok) throw new Error("Failed to reach backend");
  return res.json();
}
