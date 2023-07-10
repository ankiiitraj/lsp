import { useEffect, useState } from 'react';
import Meet from './Meet';
import Home from './Home';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import './App.css'
// import Stage from './Stage';
import LivestreamHome from './Livestreams/LivestreamHome';
import LivestreamHeader from './Livestreams/LivestreamHeader';
import LivestreamBody from './Livestreams/LivestreamBody';
// import { Route } from 'react-router';

const SERVER_URL = process.env.SERVER_URL || "http://localhost:8000"

function App() {
    const [meetingId, setMeetingId] = useState()

    const createMeeting = async () => {
        const res = await fetch(`${SERVER_URL}/meetings`, {
            method: "POST",
            body: JSON.stringify({ title: "Joint Entrance Examination" }),
            headers: { "Content-Type": "application/json" }
        })
        const resJson = await res.json()
        window.localStorage.setItem("adminId", resJson.admin_id)
        setMeetingId(resJson.data.id)
    }

    useEffect(() => {
        window.localStorage.removeItem('refImgUrl')
        const id = window.location.pathname.split('/')[2]
        if(!!!id) {
            createMeeting()
        }
    }, [])

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<><LivestreamHeader /><LivestreamBody /></>} />
                <Route path='/create-meeting' element={<Home meetingId={meetingId} />}></Route>
                <Route path='/meeting/:meetingId' element={<Meet />}></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App;