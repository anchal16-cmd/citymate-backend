import { Router } from "express";

const router = Router();

// Bookings are now live — but they're implemented directly against
// Firestore from the frontend (bookings.html / bookings.js / providers.js),
// the same way "users" and "providers" already work, rather than through
// this Express server. That keeps the architecture consistent: this
// backend only exists for things that need a secret (the Gemini API key
// behind Mia), and bookings don't need one.
//
// This endpoint is kept as a placeholder in case a future need comes up
// for server-side booking logic (e.g. sending email/SMS notifications
// when a booking is created or its status changes, which does need a
// secret — an email provider API key, etc.).
router.all("*", (req, res) => {
    res.status(501).json({
        error:
            "Bookings are handled directly via Firestore from the frontend now " +
            "(see bookings.js). This endpoint is a placeholder reserved for future " +
            "server-side booking features, like notification emails.",
    });
});

export default router;
