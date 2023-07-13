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



const LivestreamBody = () => {
    const [offset, setOffset] = useState(0)
    const [streams, setStreams] = useState([])


    const setLivestreamsToState = async () => {
        const { data } = await getLivestreams(offset)
        console.log(data)
        console.log(data.livestreams)
        setStreams(data.livestreams)
        setOffset((cur) => {
            return cur + 20 < data.total ? cur + 20 : 'END'
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
                        <Link style={{ textDecoration: 'none' }} to={`/meeting/${item.meeting_id}`}><div style={{ margin: "50px" }}>
                            <div><img src={DATA.data[0].img} height={"150px"} style={{ aspectRatio: "1920/1080", borderRadius: "5px", border: "solid 0.5px gray" }} /></div>
                            <div style={{ display: "flex", alignItems: "center", color: "white" }}>
                                <div style={{ margin: "4px 4px 4px 0px" }}>{item.name === null ? 'Unnamed Stream' : item.title.length > 18 ? item.name.substring(0, 15) + '...' : item.title}</div>
                                <div style={{ margin: "4px 4px 4px 6px", fontSize: "xx-small", backgroundColor: item.status === 'OFFLINE' ? 'gray' : 'red', padding: '1px 8px', borderRadius: "8px" }}>{item.status}</div>
                            </div>
                            <div style={{ display: "flex", fontSize: "small", color: "gray" }}>
                                <div style={{ margin: "4px 4px 4px 0px" }}>{item.views || 13} viewers</div>
                                <div style={{ margin: "4px 0px" }}>&#8226;</div>
                                <div style={{ margin: "4px" }}>{item.likes || 23} upvotes</div>
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