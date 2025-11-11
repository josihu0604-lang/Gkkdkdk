export async function submitLead(body: any): Promise<{ ok: boolean }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok };
  } catch (error) {
    console.error("Lead submission error:", error);
    return { ok: false };
  }
}
