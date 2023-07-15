/* eslint-disable */

import { useState, useEffect, useRef } from "react";
import { DyteMeeting, provideDyteDesignSystem } from "@dytesdk/react-ui-kit";
import { useDyteClient } from "@dytesdk/react-web-core";

import Heading from "./Heading";
import { joinMeeting } from "./utils";
import LiveStreamInteraction from "./Livestreams/LiveStreamInteraction";

// Constants
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8000";

const Meet = () => {
	const meetingEl = useRef();
	const [meeting, initMeeting] = useDyteClient();
	const [userToken, setUserToken] = useState();
	const [isAdminBool, setAdminBool] = useState(null);
	const meetingId = window.location.pathname.split("/")[2];

	const isAdmin = async (id) => {
		const res = await fetch(`${SERVER_URL}/is_admin`, {
			method: "POST",
			body: JSON.stringify({
				admin_id: window.localStorage.getItem("adminId") || "",
				meeting_id: meetingId || "",
			}),
			headers: { "Content-Type": "application/json" },
		});
		const resJson = await res.json();
		setAdminBool(resJson.admin);
	};

	const joinMeetingId = async () => {
		if (meetingId) {
			const authToken = await joinMeeting(
				meetingId,
				window.localStorage.getItem("adminId")
			);
			await initMeeting({
				authToken,
			});
			setUserToken(authToken);
		}
	};

	const goLive = async () => {
		const res = await fetch(`${SERVER_URL}/go_live/${meetingId}`, {
			method: "POST",
			body: JSON.stringify({ name: "name-something" }),
			headers: { "Content-Type": "application/json" },
		});
		const resJson = await res.json();
		console.log(resJson);
	};

	useEffect(() => {
		if (meetingId && !userToken) {
			joinMeetingId();
		}
		isAdmin();
	}, []);

	useEffect(() => {
		if (userToken) {
			provideDyteDesignSystem(meetingEl.current, {
				theme: "dark",
			});
		}
	}, [userToken]);

	return (
		<div
			style={{
				height: "96vh",
				width: "100vw",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{userToken && (
				<>
					{isAdminBool ? (
						<div style={{ width: "100vw" }}>
							<DyteMeeting mode="fill" meeting={meeting} ref={meetingEl} />
							<LiveStreamInteraction meetingId={meetingId} />
						</div>
					) : (
						<div style={{ width: "100vw", height: "96vh" }}>
							<DyteMeeting mode="fill" meeting={meeting} ref={meetingEl} />
							<LiveStreamInteraction meetingId={meetingId} />
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default Meet;
