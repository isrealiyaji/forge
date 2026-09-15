const asyncHandler = require("../lib/asyncHandler.js");
const instructorService = require("../services/instructorService.js");
const userService = require("../services/userService.js");

const list = asyncHandler(async (req, res) => {
  const instructors = await instructorService.listInstructors();
  res.json({ instructors });
});

const me = asyncHandler(async (req, res) => {
  const instructor = await instructorService.getInstructorByUserId(req.user.id);
  res.json({ instructor });
});

const updateMe = asyncHandler(async (req, res) => {
  await instructorService.updateInstructorProfile(req.user.id, req.body);
  res.status(204).send();
});

const updatePassword = asyncHandler(async (req, res) => {
  await userService.updatePassword(req.user.id, req.body);
  res.status(204).send();
});

const myRoster = asyncHandler(async (req, res) => {
  const instructor = await instructorService.getInstructorByUserId(req.user.id);
  const roster = await instructorService.getRoster(instructor.instructor_id);
  res.json({ roster });
});

const deactivate = asyncHandler(async (req, res) => {
  await instructorService.softDeleteInstructor(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = { list, me, updateMe, updatePassword, myRoster, deactivate };
