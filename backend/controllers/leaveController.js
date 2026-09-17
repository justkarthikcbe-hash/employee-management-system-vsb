const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

function inclusiveDayCount(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

// POST /api/leaves
async function applyLeave(req, res) {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

  const { leaveType, startDate, endDate, reason } = req.body;
  if (!leaveType || !startDate || !endDate) {
    return res.status(400).json({ message: 'leaveType, startDate and endDate are required' });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ message: 'endDate cannot be before startDate' });
  }

  const leave = new Leave({ employee: employee._id, leaveType, startDate, endDate, reason });
  await leave.save();
  res.status(201).json(leave);
}

// GET /api/leaves/me
async function getMyLeaves(req, res) {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

  const filter = { employee: employee._id };
  if (req.query.status) filter.status = req.query.status;

  const leaves = await Leave.find(filter).sort({ createdAt: -1 });
  res.json(leaves);
}

// GET /api/leaves (admin: all, filterable by status/employee)
async function listLeaves(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.employeeId) filter.employee = req.query.employeeId;

  const leaves = await Leave.find(filter)
    .populate({ path: 'employee', select: 'fullName department designation' })
    .sort({ createdAt: -1 });
  res.json(leaves);
}

// PUT /api/leaves/:id/decision (admin: approve or reject)
async function decideLeave(req, res) {
  const { decision, adminComment } = req.body; // decision: 'Approved' | 'Rejected'
  if (!['Approved', 'Rejected'].includes(decision)) {
    return res.status(400).json({ message: "decision must be 'Approved' or 'Rejected'" });
  }

  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: 'Leave request not found' });
  if (leave.status !== 'Pending') {
    return res.status(409).json({ message: `Leave request already ${leave.status.toLowerCase()}` });
  }

  leave.status = decision;
  leave.adminComment = adminComment || '';
  leave.decidedBy = req.user.id;
  leave.decidedAt = new Date();
  await leave.save();

  if (decision === 'Approved') {
    const employee = await Employee.findById(leave.employee);
    if (employee) {
      const days = inclusiveDayCount(leave.startDate, leave.endDate);
      const key = leave.leaveType.toLowerCase(); // paid | sick | unpaid
      if (employee.leaveBalance[key] !== undefined) {
        employee.leaveBalance[key] = Math.max(0, employee.leaveBalance[key] - days);
        await employee.save();
      }
    }
  }

  res.json(leave);
}

module.exports = { applyLeave, getMyLeaves, listLeaves, decideLeave };
