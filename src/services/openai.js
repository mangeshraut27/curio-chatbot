import OpenAI from 'openai';

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async analyzeMessage(message) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Curio, a helpful AI assistant for stray animal rescue. Analyze the user's message and determine:
            1. Is this about a stray animal rescue situation? (true/false)
            2. What type of animal is mentioned? (dog, cat, bird, etc. or "unknown")
            3. What is the issue/problem? (injured, sick, abandoned, lost, etc. or "unknown")
            4. What location is mentioned? (extract any location info or "unknown")
            5. Provide helpful first aid tips if applicable
            6. Generate a structured rescue report

            Respond in JSON format:
            {
              "isRescueSituation": boolean,
              "animalType": string,
              "issue": string,
              "location": string,
              "firstAidTips": string,
              "rescueReport": {
                "timestamp": string,
                "animalType": string,
                "issue": string,
                "location": string,
                "urgency": "low" | "medium" | "high",
                "recommendations": string
              },
              "needsMoreInfo": boolean,
              "followUpQuestion": string
            }`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
      });

      const result = response.choices[0].message.content;
      return JSON.parse(result);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        isRescueSituation: false,
        animalType: "unknown",
        issue: "unknown",
        location: "unknown",
        firstAidTips: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        rescueReport: null,
        needsMoreInfo: true,
        followUpQuestion: "Could you please describe the situation again?"
      };
    }
  }

  async generateResponse(analysis, userMessage) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Curio, a compassionate AI assistant for stray animal rescue. Based on the analysis provided, generate a helpful, empathetic response. 
            
            Guidelines:
            - Be warm and understanding
            - Provide practical advice
            - Ask for more information if needed
            - Show urgency for serious situations
            - Always end with encouragement
            
            Analysis: ${JSON.stringify(analysis)}`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.8,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Response Error:', error);
      return "I'm here to help with stray animal situations. Please tell me what's happening and I'll do my best to assist you.";
    }
  }
}

export default new OpenAIService(); 