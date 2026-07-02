import "dotenv/config";
import express from "express";
import cors from "cors";

import chatRoutes from "./src/routes/chat.js";
import bookingsRoutes from "./src/routes/bookings.js";

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://127.0.0.1:5500";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "citymate-backend" });
});

app.use("/api/chat", chatRoutes);
app.use("/api/bookings", bookingsRoutes); // placeholder for the future Bookings feature

app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
    console.log(`CityMate backend running at http://localhost:${PORT}`);
    console.log(`Accepting frontend requests from: ${CORS_ORIGIN}`);
});
