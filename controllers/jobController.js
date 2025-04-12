const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

module.exports = (jobModel) => ({
  createJob: async (request, reply) => {
    const jobData = {
      ...request.body,
      createdBy: request.user.userId, // Note 1
    };
    const job = await jobModel.createJob(jobData);
    reply.send(job);
  },

  getAllJobs: async (request, reply) => {
    const {
      user: { userId },
    } = request;
    const jobs = await jobModel.getAllJobs({ userId });
    reply.send({ jobs, numOfJobs: jobs.length });
  },

  getJob: async (request, reply) => {
    const {
      params: { id: jobId },
      user: { userId },
    } = request;
    const job = await jobModel.getSingleJob({ jobId, userId });
    if (!job) {
      throw new NotFoundError(`No job with id of ${jobId} was found!`);
    }
    reply.send(job);
  },

  updateJob: async (request, reply) => {
    const {
      body: payload,
      params: { id: jobId },
      user: { userId },
    } = request;
    const updatedJob = await jobModel.updateJob({ jobId, userId }, payload);
    if (!updatedJob) {
      throw new NotFoundError(`No job with id of ${jobId} was found!`);
    }
    reply.send(updatedJob);
  },

  deleteJob: async (request, reply) => {
    const {
      params: { id: jobId },
      user: { userId },
    } = request;

    const deletedJob = await jobModel.deleteJob({ jobId, userId });
    if (!deletedJob) {
      throw new NotFoundError(`No job with id of ${jobId} was found!`);
    }
    reply.send();
  },

  errorHandler: (err, request, reply) => {
    console.log(err);
    let customError = {
      statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      msg: err.message || "Something went wrong, try again later",
    };

    // Handle error thrown by fastify if user input validates our defined schemas
    if (err.code === "FST_ERR_VALIDATION") {
      if (err.validation[0].instancePath === "/status") {
        const newErrorMessage = [
          err.validation[0].instancePath,
          err.validation[0].message,
          "-> (pending, interview, declined)",
        ];
        customError.msg = newErrorMessage.join(" ");
      }
    }

    reply.status(customError.statusCode).send({ error: customError.msg });
  },
});
