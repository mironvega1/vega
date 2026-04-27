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
    api_key = os.getenv("GROQ_API_KEY", "")

    messages = [{"role": "system", "content": system}]
    for m in req.messages:
        if m.role in ("user", "assistant"):
            messages.append({"role": m.role, "content": m.content})

    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": messages,
                "max_tokens": 1000,
            }
        )
        data = res.json()
        try:
            reply = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            reply = data.get("error", {}).get("message", "Yanıt alınamadı.")
        return {"reply": reply}
