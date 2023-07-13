
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8000"

const Voting = (meetingId) => {
    const handleVote = async (type) => {
        const res = await fetch(`${SERVER_URL}/vote/${meetingId}`, {
            method: "POST",
            body: JSON.stringify({ type }),
            headers: { "Content-Type": "application/json" }
        })
    }

    return (
        <>
            <div>
                <div onClick={() => {handleVote('INCR')}}>👍</div>
                <div onClick={() => {handleVote('DECR')}}>👎</div>
            </div>
        </>
    )
}


const LiveStreamInteraction = ({ meetingId }) => {

    return (
        <>
            <Voting meetingId={meetingId}/>
        </>
    )
}

export default LiveStreamInteraction