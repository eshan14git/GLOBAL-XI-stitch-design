export interface AskRequest {
  question: string;
}

export interface AskResponse {
  answer: string;
  intent?: string;
  source?: string;
  timestamp: string;
}

/**
 * Sends a question to the Football AI backend using the real Random Forest and TF-IDF models.
 */
export async function askFootballAi(question: string): Promise<AskResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  try {
    const response = await fetch(`${API_URL}/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      answer: data.answer,
      intent: data.intent || "Unknown Intent",
      source: "Random Forest NLP Model",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.error("Error communicating with Football AI backend:", error);
    return {
      answer: `Error connecting to Football AI service at ${API_URL}. Please verify the Flask server is running.`,
      intent: "Connection Error",
      source: "Connection Manager",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
}

