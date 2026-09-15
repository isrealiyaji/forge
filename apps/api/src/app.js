const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/index.js");
const { generalLimiter } = require("./middlewares/rateLimiter.middleware.js");
const errorHandler = require("./middlewares/errorHandler.middleware.js");

const authRoutes = require("./routers/auth.routes.js");
const invitesRoutes = require("./routers/invites.routes.js");
const membersRoutes = require("./routers/members.routes.js");
const instructorsRoutes = require("./routers/instructors.routes.js");
const assignmentsRoutes = require("./routers/assignments.routes.js");
const subscriptionsRoutes = require("./routers/subscriptions.routes.js");
const classesRoutes = require("./routers/classes.routes.js");
const bookingsRoutes = require("./routers/bookings.routes.js");
const attendanceRoutes = require("./routers/attendance.routes.js");
const nutritionPlansRoutes = require("./routers/nutritionPlans.routes.js");
const adminRoutes = require("./routers/admin.routes.js");
const webhooksRoutes = require("./routers/webhooks.routes.js");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.webAppUrl,
    credentials: true,
  }),
);
app.use(cookieParser());

// Mounted before express.json() — the Paystack signature check needs the
// raw request body, which a global JSON parser would already have consumed.
app.use("/api/webhooks", webhooksRoutes);

app.use(express.json());
app.use(generalLimiter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/invites", invitesRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/instructors", instructorsRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/nutrition-plans", nutritionPlansRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found." }));
app.use(errorHandler);

module.exports = app;
