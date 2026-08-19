from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
from datetime import datetime, timezone

app = FastAPI(title="KebuGram AI Chat — 9.2", version="0.1.0")

class AiMessage(BaseModel):
    id: str
    chatId: str
    text: str
    at: str
    role: str = "assistant"
    isShowcase: bool | None = None

showcase = AiMessage(id="ai-1", chatId="1", text="Hello from KebuGram AI — guardrails ok, history 1", at="2026-08-17T12:00:00.000Z", role="assistant", isShowcase=True)

@app.get("/ai/history")
def history(chatId: str = "1"):
    return {"data": [showcase.model_dump()], "nextCursor": None}

@app.get("/ai/stream")
async def stream(prompt: str = "hello"):
    async def gen():
        # guardrails stub — real: Python scores, Java decides
        text = f"AI stream for: {prompt} — guardrails pass, history 1"
        for token in text.split(" "):
            yield f"data: {token} \n\n"
            await asyncio.sleep(0.05)
        yield "data: [DONE]\n\n"
    return StreamingResponse(gen(), media_type="text/event-stream")

@app.get("/health")
def health():
    return {"status":"ok","service":"ai-chat","version":"0.1.0"}
