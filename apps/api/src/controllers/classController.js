const asyncHandler = require("../lib/asyncHandler.js");
const classService = require("../services/classService.js");

const list = asyncHandler(async (req, res) => {
  const classes = await classService.listClasses();
  res.json({ classes });
});

const create = asyncHandler(async (req, res) => {
  const created = await classService.createClass(req.body, req.user.id);
  res.status(201).json({ class: created });
});

const updateCapacity = asyncHandler(async (req, res) => {
  await classService.updateCapacity(req.params.id, req.body.capacity, req.user.id);
  res.status(204).send();
});

const createSchedule = asyncHandler(async (req, res) => {
  const schedule = await classService.createSchedule(req.body);
  res.status(201).json({ schedule });
});

const listSchedules = asyncHandler(async (req, res) => {
  const schedules = await classService.listUpcomingSchedules();
  res.json({ schedules });
});

module.exports = { list, create, updateCapacity, createSchedule, listSchedules };
