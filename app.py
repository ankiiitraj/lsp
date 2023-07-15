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

class LivestreamsPayload(BaseModel):
    offset: str

@app.post("/get_livestreams")
async def get_livestreams(offset: LivestreamsPayload):
    path = '/livestreams?limit=100&'
    if offset.offset != '0':
        path = path + f'offset={offset.offset}'
    response = await DYTE_API.get(path)
    if response.status_code > 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()

@app.post("/vote/{meeting_id}")
async def vote(meeting_id: str, type: str):
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS votes(ts TIMESTAMP DEFAULT current_timestamp, meeting_id VARCHAR(100) UNIQUE NOT NULL, likes INT DEFAULT 0, dislikes INT DEFAULT 0)")
    payload = {}
    if type == "INCR":
        cur.execute("INSERT INTO votes(ts, meeting_id, likes, dislikes) VALUES(current_timestamp, %s, 1, 0) ON CONFLICT(meeting_id) DO UPDATE SET likes = votes.likes + 1 WHERE votes.meeting_id = %s", (meeting_id, meeting_id,))
        payload = {"message": "Vote incremented successfully"}
    else:
        cur.execute("INSERT INTO votes(ts, meeting_id, likes, dislikes) VALUES(current_timestamp, %s, 0, 1) ON CONFLICT(meeting_id) DO UPDATE SET dislikes = votes.dislikes + 1 WHERE votes.meeting_id = %s", (meeting_id, meeting_id,))
        payload = {"message": "Vote decremented successfully"}
    conn.commit()
    cur.close()
    conn.close()
    return payload

@app.get("/stats/{meeting_id}")
async def stats(meeting_id: str):
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS votes(ts TIMESTAMP DEFAULT current_timestamp, meeting_id VARCHAR(100) UNIQUE NOT NULL, likes INT DEFAULT 0, dislikes INT DEFAULT 0)")
    cur.execute("SELECT likes, dislikes FROM votes WHERE meeting_id = %s", (meeting_id))
    row = cur.fetchone()
    return row

@app.post("/viewers_count/{meeting_id}")
async def viewers_count(meeting_id: str):
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS viewers_count(ts TIMESTAMP DEFAULT current_timestamp, meeting_id VARCHAR(100) UNIQUE NOT NULL, views INT DEFAULT 0)")
    cur.execute("INSERT INTO viewers_count(ts, meeting_id, views) VALUES(current_timestamp, %s, 1) ON CONFLICT(meeting_id) DO UPDATE SET views = viewers_count.views + 1 WHERE viewers_count.meeting_id = %s", (meeting_id, meeting_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "success"}

@app.get("/viewers_count")
async def viewers_count_get():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS viewers_count(ts TIMESTAMP DEFAULT current_timestamp, meeting_id VARCHAR(100), views INT DEFAULT 0)")
    cur.execute("SELECT meeting_id, views FROM viewers_count")
    rows = cur.fetchall()
    if rows == None:
        rows =[[]]
    return rows
    

class ImageLinkUploads(BaseModel):
    image_url: str

@app.post("/img_link_upload/{meeting_id}")
async def stats(meeting_id: str, image_props: ImageLinkUploads):
    image_url = image_props.image_url
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS image_urls(ts TIMESTAMP DEFAULT current_timestamp, meeting_id VARCHAR(100), img_url VARCHAR(256))")
    cur.execute("INSERT INTO image_urls (ts, meeting_id, img_url) VALUES (current_timestamp, %s, %s)", (meeting_id, image_url,))
    conn.commit()
    cur.close()
    conn.close()
    return {"success": True}


@app.post("/img_link_upload")
async def stats():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS image_urls(ts TIMESTAMP DEFAULT current_timestamp, meeting_id VARCHAR(100), img_url VARCHAR(256))")
    cur.execute("SELECT img_url, meeting_id FROM image_urls")
    rows = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()
    return rows


if __name__ == "__main__":
    uvicorn.run("app:app", host="localhost", port=8000, log_level="debug", reload=True)
