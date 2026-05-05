const Groq = require('groq-sdk')

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const getAIResponse = async (userMessage, history = []) => {
  try {
    const messages = history.slice(-10).map(msg => ({
      role: msg.isAI ? 'assistant' : 'user',
      content: msg.content
    }))
    messages.push({ role: 'user', content: userMessage })

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are ChatBot, a helpful AI assistant inside a chat app called ChatFlow. Keep responses concise and conversational.' },
        ...messages
      ],
      max_tokens: 1024
    })

    return response.choices[0].message.content
  } catch (err) {
    console.error('AI error:', err)
    return "Sorry, I'm having trouble responding right now!"
  }
}

module.exports = { getAIResponse }