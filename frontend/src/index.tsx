import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

const theme = extendTheme({
	styles: {
		global: {
			body: {
				backgroundColor: "#070607",
				color: "white",
			},
		},
	},
});

root.render(
	<React.StrictMode>
		<ChakraProvider resetCSS={false} theme={theme}>
			<App />
		</ChakraProvider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
