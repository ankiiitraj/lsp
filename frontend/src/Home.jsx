import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ImageUploader from "./ImageInput";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8000";

function Home() {
	const [meetingId, setMeetingId] = useState();
	const [isThumbNailUploaded, setThumbnailUploaded] = useState(null);

	const createMeeting = async () => {
		const res = await fetch(`${SERVER_URL}/meetings`, {
			method: "POST",
			body: JSON.stringify({ title: "Dyte Stream" }),
			headers: { "Content-Type": "application/json" },
		});
		const resJson = await res.json();
		window.localStorage.setItem("adminId", resJson.admin_id);
		setMeetingId(resJson.data.id);
	};

	useEffect(() => {
		const id = window.location.pathname.split("/")[2];
		if (!!!id) {
			createMeeting();
		}
	}, []);

	return (
		<div
			style={{
				height: "100vh",
				width: "100vw",
				fontSize: "x-large",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				color: "white  ",
			}}
		>
			{meetingId && !window.location.pathname.split("/")[2] && (
				<>
					<div>
						{isThumbNailUploaded ? (
							meetingId && (
								<Link to={`/meeting/${meetingId}`}>
									Enter Meeting and start livestream
								</Link>
							)
						) : meetingId ? (
							<ImageUploader
								meetingId={meetingId}
								setImgUploadedStatus={setThumbnailUploaded}
							/>
						) : (
							<>Something bad happened, try reloading</>
						)}
					</div>
				</>
			)}
		</div>
	);
}

export default Home;
