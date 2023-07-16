import { useState } from "react";
import { Input } from "@chakra-ui/react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8000";

function ImageUploader({ setImgUploadedStatus, meetingId }) {
	const [selectedFile, setSelectedFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState(null);
	const [uploadSuccess, setUploadSuccess] = useState(false);
	const [title, setTitle] = useState("demo livestream");

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
		setUploadSuccess(false);
		setUploadError(null);
	};

	const sendImgLinkToServer = async (imageUrl) => {
		await fetch(`${SERVER_URL}/img_link_upload/${meetingId}`, {
			method: "POST",
			body: JSON.stringify({ image_url: imageUrl }),
			headers: { "Content-Type": "application/json" },
		});
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setUploading(true);
		setUploadError(null);

		try {
			const formData = new FormData();
			formData.append("image", selectedFile);

			const response = await fetch("https://api.imgur.com/3/image", {
				method: "POST",
				headers: {
					Authorization: "Client-ID 48f0caef7256b40",
				},
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to upload image");
			}

			const data = await response.json();
			sendImgLinkToServer(data.data.link);
			setUploadSuccess(data.data.link);
			setImgUploadedStatus(true);
		} catch (error) {
			setUploadError(error.message);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<div style={{ marginBottom: "10px" }}>Create a new livestream </div>
			<div>
				<input type="file" id="file" onChange={handleFileChange} />
				<Input
					placeholder="Title of the livestream"
					sx={{ color: "white", marginTop: "20px" }}
					value={title}
					onInput={(e) => {
						setTitle(e.target.value);
					}}
				/>
				<form
					onSubmit={handleSubmit}
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						marginTop: "1rem",
					}}
				>
					<button
						type="submit"
						disabled={!selectedFile || uploading || uploadSuccess}
						style={{
							marginTop: "10px",
							padding: "0.5rem 1rem",
							backgroundColor: "#2060FD",
							color: "#fff",
							border: "none",
							borderRadius: "0.25rem",
							cursor: "pointer",
						}}
					>
						{uploading ? "Starting..." : "Start"}
					</button>
				</form>
			</div>
			{uploadError && (
				<div style={{ marginTop: "10px", color: "red" }}>{uploadError}</div>
			)}
		</div>
	);
}

export default ImageUploader;
