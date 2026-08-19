from pydantic import BaseModel

class TranscodeJob(BaseModel):
    object_key: str
    content_type: str

# Python intelligence — transcoding progress simulation (real: FFmpeg on GPU)
def transcode(job: TranscodeJob) -> dict:
    return {"object_key": job.object_key, "status": "transcoding", "progress": 42, "next_poll_ms": 2000}

class MiniPayIntent(BaseModel):
    payee_id: str
    amount_minor: int | None = None
    currency: str | None = "RWF"

def qr_payload(intent: MiniPayIntent) -> str:
    base = f"kebupay://pay?payee={intent.payee_id}"
    if intent.amount_minor: base += f"&amount={intent.amount_minor}&cur={intent.currency}"
    return base
