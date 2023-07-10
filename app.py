import base64
import io
import logging
import random
import requests

import uvicorn
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from imgur import upload_image
from utils import generate_a_name
import face_recognition
import psycopg2

import os
import base64
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from httpx import AsyncClient
import uuid

load_dotenv()

DYTE_API_KEY = os.getenv("DYTE_API_KEY")
DYTE_ORG_ID = os.getenv("DYTE_ORG_ID")

API_HASH = base64.b64encode(f"{DYTE_ORG_ID}:{DYTE_API_KEY}".encode('utf-8')).decode('utf-8')

DYTE_API = AsyncClient(base_url='https://api.cluster.dyte.in/v2', headers={'Authorization': f"Basic {API_HASH}"})

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

fh = logging.FileHandler("app.log")
fh.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
fh.setFormatter(formatter)
logger.addHandler(fh)


class ParticipantScreen(BaseModel):
    audio_file: UploadFile
    participant_id: str
    meeting_id: str
    participant_name: str

class ProctorPayload(BaseModel):
    meeting_id: str
    admin_id: str

class AdminProp(BaseModel):
    meeting_id: str
    admin_id: str

class Meeting(BaseModel):
    title: str

class Participant(BaseModel):
    name: str
    preset_name: str
    meeting_id: str

origins = [
    # allow all
    "*",
]

app = FastAPI()

# enable cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # allow all
    allow_headers=["*"],  # allow all
)

def connect_to_db():
    conn = psycopg2.connect(
            dbname=os.getenv('DB_USER'), 
            user=os.getenv('DB_USER'), 
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=5432
    )
    return conn

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/is_admin/")
async def multiple_faces_list(admin: AdminProp):
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT count(1) FROM meeting_host_info WHERE meeting_id = %s AND admin_id = %s", (admin.meeting_id, admin.admin_id,))
    
    count = cur.fetchone()[0]
    
    if(count > 0):
        return { "admin": True }
    else:
        return { "admin": False }

@app.post("/meetings")
async def create_meeting(meeting: Meeting):
    payload = meeting.dict()
    # payload.update({"live_stream_on_start": True})
    response = await DYTE_API.post('/meetings', json=payload)
    if response.status_code >= 300:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    admin_id = ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=32)) + '@@' + generate_a_name()
    resp_json = response.json()
    resp_json['admin_id'] = admin_id
    meeting_id = resp_json['data']['id']

    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO meeting_host_info (ts, meeting_id, admin_id) VALUES (CURRENT_TIMESTAMP, %s, %s)", (meeting_id, admin_id))
    conn.commit()
    cur.close()
    conn.close()

    return resp_json


@app.post("/meetings/{meetingId}/participants")
async def add_participant(meetingId: str, participant: Participant):
    client_specific_id = f"react-samples::{participant.name.replace(' ', '-')}-{str(uuid.uuid4())[0:7]}"
    payload = participant.dict()
    payload.update({"client_specific_id": client_specific_id})
    del payload['meeting_id']
    resp = await DYTE_API.post(f'/meetings/{meetingId}/participants', json=payload)
    if resp.status_code > 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.text

class GoLive(BaseModel):
    name: str

@app.post("/go_live/{meetingId}")
async def go_live(meetingId: str, name: GoLive):
    # conn = connect_to_db()
    # cur = conn.cursor()
    # cur.execute("CREATE TABLE IF NOT EXISTS livestream_t (ts TIMESTAMP, meeting_id VARCHAR(200))")
    # cur.execute("SELECT COUNT(1) FROM livestream_t WHERE meeting_id=%s", (meetingId))
    # count = cur.fetchone()[0]

    # if count == 0:
    response = await DYTE_API.post(f'/meetings/{meetingId}/livestreams', json=name.dict())
    # cur.execute("INSERT INTO livestream_t (ts, meeting_id) VALUES (current_timestamp, %s)", (meetingId))
    # conn.commit()
    # cur.close()
    # conn.close()
    if response.status_code > 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()
    # else:
    #     conn.commit()
    #     cur.close()
    #     conn.close()
    #     return {"message": "livestream already started"}

class LivestreamsPayload(BaseModel):
    offset: str

@app.post("/get_livestreams")
async def get_livestreams(offset: LivestreamsPayload):
    path = '/livestreams?'
    if offset.offset != '0':
        path = path + f'offset={offset.offset}'
    response = await DYTE_API.get(path)
    if response.status_code > 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()
    

if __name__ == "__main__":
    uvicorn.run("app:app", host="localhost", port=8000, log_level="debug", reload=True)
