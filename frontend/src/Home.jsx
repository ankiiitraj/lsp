import { Link } from "react-router-dom"

function Home({ meetingId }) {

    return (
        <div style={{ height: "100vh", width: "100vw", fontSize: "x-large", display: "flex", justifyContent: "center", alignItems: "center", color: "white  "}}>
            {(meetingId && !window.location.pathname.split('/')[2]) && 
                <>
                    <div>
                        {meetingId && <Link to={`/meeting/${meetingId}`}>Create Meeting and Livestream</Link>}
                    </div>
                </>
            }
        </div>
    )
}

export default Home