export async function generateSessionSummary(topic, rawNotes) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    return 'Add VITE_GEMINI_API_KEY in .env to enable AI session summaries.'
  }

  const prompt = `You are a peer tutoring assistant. Summarize these rough session notes for the topic "${topic}" into:
1. Key Concepts Covered (3 concise bullets)
2. Practice Action Items for the Student (2 bullets)

Notes:
${rawNotes || 'General introductory walkthrough and live Q&A.'}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  const data = await res.json()
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'Could not generate summary at this time.'
  )
}