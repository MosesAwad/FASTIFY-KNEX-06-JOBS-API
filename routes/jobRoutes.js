const authPlugin = require("../plugins/authentication");
const { createJobOpts, updateJobOpts } = require("../schemas/jobSchemas");

async function jobRoutes(fastify, options) {
  const { jobModel } = options;
  const { getAllJobs, getJob, createJob, deleteJob, updateJob, errorHandler } =
    require("../controllers/jobController")(jobModel);

  // Register auth plugin
  fastify.register(authPlugin);

  // Set the error handler
  fastify.setErrorHandler(errorHandler);

  // Set the endpoints
  fastify.post("/jobs", createJobOpts, createJob);
  fastify.get("/jobs", getAllJobs);
  fastify.get("/jobs/:id", getJob);
  fastify.patch("/jobs/:id", updateJobOpts, updateJob);
  fastify.delete("/jobs/:id", deleteJob);
}

module.exports = jobRoutes;

/*
	NOTES

	Note 1

	This is added as an assurance mechanism to make sure that no user can create a job on behalf of 
	another user. So essentially, we always assign createdBy to the userId we decode from the JWT. So 
	regardless of whether the original request had a createdBy field in the json (scenario 1) or not 
	(scenario 2), this would add a createdBy (scenario 1) or override it (scenario 2) with the value 
	equally to none other than the user's id.

*/
