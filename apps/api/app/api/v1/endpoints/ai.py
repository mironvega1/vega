from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import httpx
import os

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    context: str = ""

@router.post("/ai/chat")
async def ai_chat(req: ChatRequest):
    system = req.context or "Sen Vega AI'sin. Türkiye gayrimenkul uzmanısın. Sadece emlak konularında yardımcı ol. Türkçe yanıt ver."
    api_key = os.getenv("GEMINI_API_KEY", "")

    # Convert messages to Gemini format (role: user/model, parts: [{text}])
    # Gemini doesn't accept "assistant" role, uses "model" instead
    # First message must be from "user"
    gemini_messages = []
    for m in req.messages:
        role = "model" if m.role == "assistant" else "user"
        gemini_messages.append({"role": role, "parts": [{"text": m.content}]})

    # Remove leading model messages (Gemini requires first turn to be user)
    while gemini_messages and gemini_messages[0]["role"] == "model":
        gemini_messages.pop(0)

    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}",
            headers={"Content-Type": "application/json"},
            json={
                "systemInstruction": {"parts": [{"text": system}]},
                "contents": gemini_messages,
                "generationConfig": {"maxOutputTokens": 1000}
            }
        )
        data = res.json()
        try:
            reply = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            reply = "Yanıt alınamadı."
        return {"reply": reply}
