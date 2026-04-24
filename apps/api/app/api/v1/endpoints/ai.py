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
    system = req.context or "Sen Vega AI'sin. Turkiye gayrimenkul uzmanisın. Sadece emlak konularında yardımcı ol. Türkçe yanıt ver."
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": os.getenv("ANTHROPIC_API_KEY", ""),
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 1000,
                "system": system,
                "messages": [m.dict() for m in req.messages]
            }
        )
        data = res.json()
        reply = data.get("content", [{}])[0].get("text", "Yanıt alınamadı.")
        return {"reply": reply}
