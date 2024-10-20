import subprocess
import os
import requests
import json
from fastapi import FastAPI, HTTPException, Query
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from pyngrok import ngrok

cred = credentials.Certificate("service_account.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

load_dotenv()

app = FastAPI()

process = None

ngrok.set_auth_token(os.environ.get("NGROK_AUTH_TOKEN"))
http_tunnel = ngrok.connect(8000)
ngrok_url = http_tunnel.public_url

@app.post("/start")
async def start_voice_agent(chat_id: str = Query(...)):
    global process
    global ngrok_url
    print(f"Ngrok URL: {ngrok_url}")
    if process is not None:
        raise HTTPException(status_code=400, detail="Voice agent is already running")
    dg_api_key = os.environ.get("DEEPGRAM_API_KEY")
    if dg_api_key is None:
        raise HTTPException(status_code=500, detail="DEEPGRAM_API_KEY env var not present")
    try:
        process = subprocess.Popen(["python", "voice_agent.py", "--chat_id", chat_id, "--ngrok_url", ngrok_url])
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

@app.get("/temperature")
async def get_temperature():
    response = requests.get(os.getenv("IOT_ENDPOINT"))
    temperature = response.json()["feeds"][-1]["field3"]
    return {"temperature": f"{temperature}°F"}

@app.get("/humidity")
async def get_humidity():
    response = requests.get(os.getenv("IOT_ENDPOINT"))
    humidity = response.json()["feeds"][-1]["field1"]
    return {"humidity": f"{humidity}%"}

@app.get("/light_intensity")
async def get_light_intensity():
    response = requests.get(os.getenv("IOT_ENDPOINT"))
    light_intensity = response.json()["feeds"][-1]["field4"]
    return {"light_intensity": f"{light_intensity} lux"}

@app.get("/soil_moisture")
async def get_soil_moisture():
    response = requests.get(os.getenv("IOT_ENDPOINT"))
    soil_moisture = response.json()["feeds"][-1]["field5"]
    return {"soil_moisture": f"{int(soil_moisture)/1000*100}%"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)