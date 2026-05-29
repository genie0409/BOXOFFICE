import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

const app = express();
app.use(express.json());

// Logger middleware for Vercel executions
app.use((req, res, next) => {
  console.log(`[Vercel Serverless API] ${req.method} ${req.url}`);
  next();
});

// API Route: Get Daily Box Office
app.get("/api/boxoffice", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== "string" || date.length !== 8) {
      return res.status(400).json({ error: "targetDt (YYYYMMDD) is required and must be 8 digits." });
    }
    const apiKey = process.env.KOBIS_API_KEY || "1659cae3ca3e8fabc496c94789add564";
    const url = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${date}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`KOBIS Box Office API status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Vercel Box Office Proxy Error:", error);
    res.status(500).json({ error: error.message || "Internal server proxy error" });
  }
});

// API Route: Get Movie Details
app.get("/api/movie", async (req, res) => {
  try {
    const { movieCd } = req.query;
    if (!movieCd || typeof movieCd !== "string") {
      return res.status(400).json({ error: "movieCd parameter is required." });
    }
    const apiKey = process.env.KOBIS_API_KEY || "1659cae3ca3e8fabc496c94789add564";
    const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${movieCd}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`KOBIS Movie Info API status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Vercel Movie Detail Proxy Error:", error);
    res.status(500).json({ error: error.message || "Internal server proxy error" });
  }
});

// API Route: Generate AI Review based on 3 user keywords
app.post("/api/generate-review", async (req, res) => {
  try {
    const { movieTitle, keywords } = req.body;
    if (!movieTitle) {
      return res.status(400).json({ error: "movieTitle is required." });
    }
    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ error: "keywords must be an array of strings." });
    }

    const cleanKeywords = keywords.map((k: any) => String(k || "").trim()).filter(Boolean);
    if (cleanKeywords.length === 0) {
      return res.status(400).json({ error: "At least one non-empty keyword is required." });
    }

    const client = getGeminiClient();
    const prompt = `영화 "${movieTitle}"에 대한 매우 유려하고 흥미로운 150자~250자 분량의 영화 감상평을 한 문단으로 작성해 주세요. \n이 감상평에는 반드시 다음의 키워드들이 자연스럽게 녹아들어 포함되어야 합니다: ${cleanKeywords.join(", ")}.\n\n형식은 구구절절한 부연설명이나 제목('감상평:', '리뷰' 등), 인사말이나 구분선 일체 없이 감상평 본문의 텍스트만 바로 문단으로 반환해 주세요.`;

    const geminiResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an award-winning, elegant movie critic known for writing evocative and beautifully phrased film reviews in Korean. You weave requested keywords seamlessly into the core prose.",
        temperature: 0.8,
      }
    });

    const reviewText = geminiResponse.text || "감상평을 생성하지 못했습니다. 다시 시도해 주세요.";
    res.json({ review: reviewText.trim() });
  } catch (error: any) {
    console.error("Gemini AI Review Error:", error);
    res.status(500).json({ error: error.message || "감상평을 생성하는 과정에서 서버 오류가 발생했습니다." });
  }
});

export default app;
