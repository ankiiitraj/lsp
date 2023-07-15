import { Link } from "react-router-dom";
import DytestreamLogo from "./assets/dytestream.png";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8000";

const LivestreamHeader = () => {
	return (
		<>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "20px 50px",
				}}
			>
				<Link to="/">
					<div>
						<img src={DytestreamLogo} height={"30px"} />
					</div>
				</Link>
				<Link style={{ textDecoration: "none" }} to={`/create-meeting`}>
					<div
						style={{
							color: "white",
							borderRadius: "5px",
							padding: "10px 25px",
							backgroundColor: "#2160fd",
							fontSize: "small",
						}}
					>
						Start a new livestream
					</div>
				</Link>
			</div>
		</>
	);
};

export default LivestreamHeader;
