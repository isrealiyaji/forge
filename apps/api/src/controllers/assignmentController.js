const asyncHandler = require("../lib/asyncHandler.js");
const assignmentService = require("../services/assignmentService.js");

const listLoads = asyncHandler(async (req, res) => {
  const loads = await assignmentService.getInstructorLoads();
  res.json({ instructors: loads });
});

const reassign = asyncHandler(async (req, res) => {
  await assignmentService.reassignMember(req.body.memberId, req.body.instructorId, req.user.id);
  res.status(204).send();
});

const rebalance = asyncHandler(async (req, res) => {
  const result = await assignmentService.rebalance(req.user.id);
  res.json(result);
});

module.exports = { listLoads, reassign, rebalance };
