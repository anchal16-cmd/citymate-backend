import { Router } from "express";

const router = Router();

// Placeholder for the future Bookings feature. Returning a clear,
// honest "not built yet" response is better than a silent 404 —
// the frontend's bookings.html already shows a "coming soon" page,
// this keeps the API consistent with that once it starts calling in.
router.all("*", (req, res) => {
    res.status(501).json({
        error: "Bookings isn't built yet. This endpoint is a placeholder for that feature.",
    });
});

export default router;
