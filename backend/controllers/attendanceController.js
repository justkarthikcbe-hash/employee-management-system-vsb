const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const MIN_HOURS_FOR_PRESENT = 6;
const MIN_HOURS_FOR_HALF_DAY = 3;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function computeStatus(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 'Half-day';
  const hours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
  if (hours >= MIN_HOURS_FOR_PRESENT) return 'Present';
  if (hours >= MIN_HOURS_FOR_HALF_DAY) return 'Half-day';
  return 'Absent';
}

// POST /api/attendance/check-in
async function checkIn(req, res) {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

  const date = todayStr();
  let record = await Attendance.findOne({ employee: employee._id, date });
  if (record && record.checkIn) {
    return res.status(409).json({ message: 'Already checked in today' });
  }
  if (!record) {
    record = new Attendance({ employee: employee._id, date, checkIn: new Date(), status: 'Half-day' });
  } else {
    record.checkIn = new Date();
  }
  await record.save();
  res.status(201).json(record);
}

// POST /api/attendance/check-out
async function checkOut(req, res) {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

  const date = todayStr();
  const record = await Attendance.findOne({ employee: employee._id, date });
  if (!record || !record.checkIn) return res.status(400).json({ message: 'You must check in before checking out' });
  if (record.checkOut) return res.status(409).json({ message: 'Already checked out today' });

  record.checkOut = new Date();
  record.status = computeStatus(record.checkIn, record.checkOut);
  await record.save();
  res.json(record);
}

// GET /api/attendance/me?from=&to=
async function getMyAttendance(req, res) {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

  const filter = { employee: employee._id };
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = req.query.from;
    if (req.query.to) filter.date.$lte = req.query.to;
  }
  const records = await Attendance.find(filter).sort({ date: -1 });
  res.json(records);
}

// GET /api/attendance  (admin: all employees, filterable)
async function listAttendance(req, res) {
  const { employeeId, from, to, department } = req.query;
  const filter = {};
  if (employeeId) filter.employee = employeeId;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  let query = Attendance.find(filter).populate({
    path: 'employee',
    select: 'fullName department designation',
  }).sort({ date: -1 });

  let records = await query;
  if (department) {
    records = records.filter((r) => r.employee && r.employee.department === department);
  }
  res.json(records);
}

module.exports = { checkIn, checkOut, getMyAttendance, listAttendance };
