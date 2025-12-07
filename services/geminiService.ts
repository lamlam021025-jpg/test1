import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryItem, TransportType, MetroCity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using standard gemini-2.5-flash for JSON tasks
const MODEL_NAME = "gemini-2.5-flash";

export const generateItinerary = async (
  destination: string,
  days: number,
  interests: string
): Promise<ItineraryItem[]> => {
  const prompt = `
    Plan a ${days}-day trip to ${destination}. Interests: ${interests}.
    Generate a list of itinerary items.
    Include specific transportation details if moving between cities or major spots (use realistic transport modes for Taiwan/Global).
    For Metro in Taiwan (Taipei, Kaohsiung, etc.), specify the line color.
    Estimate costs in TWD.
    Return JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dayIndex: { type: Type.INTEGER },
              startTime: { type: Type.STRING, description: "HH:mm format" },
              endTime: { type: Type.STRING, description: "HH:mm format" },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING, enum: ["TRANSPORT", "ACTIVITY", "FOOD", "ACCOMMODATION"] },
              cost: { type: Type.NUMBER },
              locationName: { type: Type.STRING },
              transportType: { type: Type.STRING, enum: ["METRO", "BUS", "TRAIN_HSR", "TRAIN_TRA", "FLIGHT", "TAXI", "WALK", "OTHER"], nullable: true },
              transportProvider: { type: Type.STRING, nullable: true },
              metroCity: { type: Type.STRING, enum: ["TAIPEI", "TAICHUNG", "KAOHSIUNG", "TAOYUAN", "NONE"], nullable: true },
            },
            required: ["dayIndex", "startTime", "title", "category", "cost"],
          },
        },
      },
    });

    const rawItems = JSON.parse(response.text || "[]");
    
    // Map to our internal structure with IDs
    return rawItems.map((item: any) => ({
      id: crypto.randomUUID(),
      dayIndex: item.dayIndex,
      startTime: item.startTime,
      endTime: item.endTime,
      title: item.title,
      description: item.description,
      category: item.category,
      location: { name: item.locationName || item.title },
      cost: item.cost,
      transportDetails: item.category === 'TRANSPORT' ? {
        type: item.transportType || TransportType.OTHER,
        provider: item.transportProvider,
        metroCity: item.metroCity as MetroCity || MetroCity.NONE
      } : undefined
    }));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const estimateTravelTime = async (origin: string, destination: string, mode: string): Promise<{ duration: string, distance: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Estimate the travel time and distance from ${origin} to ${destination} by ${mode}. 
            Be concise. Return a JSON object with 'duration' (e.g. '20 mins') and 'distance' (e.g. '5 km').`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        duration: { type: Type.STRING },
                        distance: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        return { duration: "Unknown", distance: "Unknown" };
    }
}
