require("dotenv").config();
const fastify = require("fastify")({
  logger: true,
});
const connectDB = require("./connect/connect");
const authRoutes = require("./routes/authRoutes.js");
const jobRoutes = require("./routes/jobRoutes.js");
const User = require("./models/User");
const Job = require("./models/Job");

const start = async () => {
  try {
    // 1. Connect to DB
    const db = await connectDB("application");
    console.log("Database connected");

    // 2. Initiliaze models
    const userModel = new User(db);
    await userModel.initTable();
    console.log("Users table initialized");
    const jobModel = new Job(db);
    await jobModel.initTable();
    console.log("Jobs table initialized");

    // 3. Register routes
    fastify.register(authRoutes, { userModel });
    fastify.register(jobRoutes, { jobModel });

    // 4. Start server
    await fastify.listen({ port: 3000 });
    console.log("Server running on http://localhost:3000");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

start();
