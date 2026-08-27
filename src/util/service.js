

export const fetchChatResponse = async (messages) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: messages,
    }),
  });

  if (!response.ok) {
    throw new Error("Network response failed");
  }

  const data = await response.json();
  
  return data.choices[0].message.content;
};
