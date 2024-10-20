import asyncio
import subprocess
import os
from fastapi import FastAPI, HTTPException, Query
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("service_account.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

load_dotenv()

app = FastAPI()

process = None

@app.post("/start")
async def start_voice_agent(chat_id: str = Query(...)):
    global process
    if process is not None:
        raise HTTPException(status_code=400, detail="Voice agent is already running")
    dg_api_key = os.environ.get("DEEPGRAM_API_KEY")
    if dg_api_key is None:
        raise HTTPException(status_code=500, detail="DEEPGRAM_API_KEY env var not present")
    try:
        process = subprocess.Popen(["python", "voice_agent.py", "--chat_id", chat_id])
        db.collection('chats').doc(chat_id).update({
            'chat_id': chat_id
        })
        return {"message": "Voice agent started", "chat_id": chat_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start voice agent: {str(e)}")

@app.post("/stop")
async def stop_voice_agent():
    global process
    if process is None:
        raise HTTPException(status_code=400, detail="Voice agent is not running")

    try:
        process.terminate()
        process.wait(timeout=5)
        process = None
        return {"message": "Voice agent stopped"}
    except subprocess.TimeoutExpired:
        process.kill()
        process = None
        return {"message": "Voice agent forcefully stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop voice agent: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
