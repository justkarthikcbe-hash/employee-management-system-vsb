const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// GET /api/payroll/me
async function getMyPayroll(req, res) {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

  const records = await Payroll.find({ employee: employee._id }).sort({ year: -1, month: -1 });
  res.json(records);
}

// GET /api/payroll (admin: all, filterable)
async function listPayroll(req, res) {
  const filter = {};
  if (req.query.employeeId) filter.employee = req.query.employeeId;
  if (req.query.month) filter.month = Number(req.query.month);
  if (req.query.year) filter.year = Number(req.query.year);

  const records = await Payroll.find(filter)
    .populate({ path: 'employee', select: 'fullName department designation' })
    .sort({ year: -1, month: -1 });
  res.json(records);
}

// POST /api/payroll (admin: create or update a month's payroll for an employee)
async function upsertPayroll(req, res) {
  const { employeeId, month, year, basic, allowances, deductions } = req.body;
  if (!employeeId || !month || !year) {
    return res.status(400).json({ message: 'employeeId, month and year are required' });
  }
  if (basic < 0 || allowances < 0 || deductions < 0) {
    return res.status(400).json({ message: 'Salary figures cannot be negative' });
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });

  let record = await Payroll.findOne({ employee: employeeId, month, year });
  if (!record) {
    record = new Payroll({ employee: employeeId, month, year });
  }
  record.basic = basic ?? record.basic ?? 0;
  record.allowances = allowances ?? record.allowances ?? 0;
  record.deductions = deductions ?? record.deductions ?? 0;
  record.updatedBy = req.user.id;
  await record.save();

  res.status(201).json(record);
}

module.exports = { getMyPayroll, listPayroll, upsertPayroll };
