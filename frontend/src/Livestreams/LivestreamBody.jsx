import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getLivestreams } from "../utils"

const DATA = {
    data: [
        { title: "title1 some new vido that going to be viral", img: "https://m.media-amazon.com/images/M/MV5BYzBiYjlhNGEtNjJkNi00NDc0LWIyMDMtMTg0NDUwZjcxNmY4XkEyXkFqcGdeQXVyMjg2MTMyNTM@._V1_.jpg", status: "LIVE", views: 100, likes: 100 },
        { title: "title1", img: "https://m.media-amazon.com/images/M/MV5BYzBiYjlhNGEtNjJkNi00NDc0LWIyMDMtMTg0NDUwZjcxNmY4XkEyXkFqcGdeQXVyMjg2MTMyNTM@._V1_.jpg", status: "LIVE", views: 100, likes: 100 },
        { title: "title1", img: "https://m.media-amazon.com/images/M/MV5BYzBiYjlhNGEtNjJkNi00NDc0LWIyMDMtMTg0NDUwZjcxNmY4XkEyXkFqcGdeQXVyMjg2MTMyNTM@._V1_.jpg", status: "LIVE", views: 100, likes: 100 },
        { title: "title1", img: "https://m.media-amazon.com/images/M/MV5BYzBiYjlhNGEtNjJkNi00NDc0LWIyMDMtMTg0NDUwZjcxNmY4XkEyXkFqcGdeQXVyMjg2MTMyNTM@._V1_.jpg", status: "LIVE", views: 100, likes: 100 },
        { title: "title1", img: "https://m.media-amazon.com/images/M/MV5BYzBiYjlhNGEtNjJkNi00NDc0LWIyMDMtMTg0NDUwZjcxNmY4XkEyXkFqcGdeQXVyMjg2MTMyNTM@._V1_.jpg", status: "LIVE", views: 100, likes: 100 },
    ]
}
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8000"


const LivestreamBody = () => {
    const [offset, setOffset] = useState(0)
    const [streams, setStreams] = useState([])


    const setLivestreamsToState = async () => {
        const { data } = await getLivestreams(offset)
        const meetingIds = data.livestreams.map(item => item.meeting_id).filter(item => item !== null)
        const rawThumbnailsDataRes = await fetch(`${SERVER_URL}/img_link_upload`, {
            method: "POST",
            body: JSON.stringify({ meeting_ids: meetingIds }),
            headers: { "Content-Type": "application/json" }
        })
        const thumbnails = await rawThumbnailsDataRes.json()
        const livestreamWithThumbnails = data.livestreams.map(item => ({...item, thumbnail: thumbnails.filter(subItem => item.meeting_id === subItem[1])[0] || [undefined]}))
        const rawViewsCountData = await fetch(`${SERVER_URL}/viewers_count`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })
        const views = await rawViewsCountData.json()
        const streams = livestreamWithThumbnails.map(item => ({...item, views: views.filter(subItem => item.meeting_id === subItem[0])[0] || [0]}))
        console.log(streams)
        setStreams(streams)
        setOffset((cur) => {
            return cur + 20 < data.total ? cur + 20 : 'END'
        })
    }

    const handleClick = (meetingId) => {
        fetch(`${SERVER_URL}/viewers_count/${meetingId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        })
    }

    useEffect(() => {
        setLivestreamsToState()
    }, [])

    return (
        <>
            {/* <div style={{ padding: "0px 100px"}}>Trending</div>  */}
            <div style={{ display: "flex", padding: "10px 100px", justifyContent: "center", flexWrap: "wrap" }}>
                {streams && streams.map(item => {
                    return (item.meeting_id &&
                        <Link style={{ textDecoration: 'none' }} onClick={() => handleClick(item.meeting_id)} to={`/meeting/${item.meeting_id}`}><div style={{ margin: "50px" }}>
                            <div><img src={item.thumbnail[0] || DATA.data[0].img} height={"150px"} style={{ aspectRatio: "1920/1080", borderRadius: "5px", border: "solid 0.5px gray" }} /></div>
                            <div style={{ display: "flex", alignItems: "center", color: "white" }}>
                                <div style={{ margin: "4px 4px 4px 0px" }}>{item.name === null ? `Meeting: ${item.meeting_id}`.length > 18 ? `Meeting: ${item.meeting_id}`.substring(0, 15) + '...': `Meeting: ${item.meeting_id}` : item.name.length > 18 ? item.name.substring(0, 15) + '...' : item.title}</div>
                                <div style={{ margin: "4px 4px 4px 6px", fontSize: "xx-small", backgroundColor: item.status === 'OFFLINE' ? 'gray' : 'red', padding: '1px 8px', borderRadius: "8px" }}>{item.status}</div>
                            </div>
                            <div style={{ display: "flex", fontSize: "small", color: "gray" }}>
                                <div style={{ margin: "4px 4px 4px 0px" }}>{item.views[1] || 0} viewers</div>
                                <div style={{ margin: "4px 0px" }}>&#8226;</div>
                                <div style={{ margin: "4px" }}>{item.views[1] || 23} upvotes</div>
                            </div>
                        </div>
                        </Link>
                    )
                })}
            </div>
        </>
    )
}


export default LivestreamBody;