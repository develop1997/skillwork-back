import dotenv from "dotenv";
import { createDebugger } from "../src/utils/debugConfig";
import { App } from "../src/app";

// CONFIGURATION
dotenv.config();
const PORT: number = parseInt(process.env.PORT ?? '3000', 10);

// APP
const app = new App().config();

// DEBUGGER
const serverDebugger = createDebugger('server');


// LISTEN
app.listen(PORT, () => {
    serverDebugger(`Listening on port ${PORT}`);
});

export default app