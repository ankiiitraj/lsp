import { useState } from "react";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8000";

const Voting = () => {
	const handleVote = async (type) => {
		const meetingId = window.location.pathname.split("/")[2]
		fetch(`${SERVER_URL}/vote/${meetingId}`, {
			method: "POST",
			body: JSON.stringify({ type }),
			headers: { "Content-Type": "application/json" },
		});
	};

	const [likeCount, setLikeCount] = useState(0);

	return (
		<>
			<Flex
				backgroundColor="#252525"
				paddingLeft={"40px"}
				paddingBottom={"20px"}
			>
				<Box>
					{likeCount == 0 ? (
						<Icon
							as={FiThumbsUp}
							boxSize={8}
							sx={{ cursor: "pointer" }}
							onClick={() => {
								setLikeCount(1);
								handleVote("INCR");
							}}
						/>
					) : (
						<Icon
							as={FaThumbsUp}
							boxSize={8}
							sx={{ cursor: "pointer" }}
						/>
					)}
					<Text ml={1} style={{ margin: "0px", fontSize: "13px"}}>Upvote</Text>
				</Box>
			</Flex>
		</>
	);
};

const LiveStreamInteraction = ({ meetingId }) => {
	return (
		<>
			<Voting meetingId={meetingId} />
		</>
	);
};

export default LiveStreamInteraction;
