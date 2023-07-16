import { useEffect, useState } from "react";
import Meet from "./Meet";
import Home from "./Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import LivestreamHeader from "./Livestreams/LivestreamHeader";
import LivestreamBody from "./Livestreams/LivestreamBody";

function App() {
	return (
		<BrowserRouter>
        <LivestreamHeader />
            <Routes>
                <Route path='/' element={<><LivestreamBody /></>} />
                <Route path='/create-meeting' element={<Home />}></Route>
                <Route path='/meeting/:meetingId' element={<Meet />}></Route>
            </Routes>
        </BrowserRouter>
	);
}

export default App;
