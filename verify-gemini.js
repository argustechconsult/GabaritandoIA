
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Error: NEXT_PUBLIC_GEMINI_API_KEY is not set.");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

async function main() {
  try {
    console.log("Testing Gemini API Key with model: gemini-2.0-flash-exp...");
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: {
        parts: [
          {
            text: "Hello, reply with 'Connection Successful' if you receive this message.",
          },
        ],
      },
    });

    console.log("\nResponse from Gemini:");
    if (response.text) {
        console.log(response.text);
    } else {
        // Fallback for different SDK response structures
        console.log("Response object:", JSON.stringify(response, null, 2));
    }

  } catch (error) {
    console.error("Error testing API Key:", error);
    process.exit(1);
  }
}

main();
