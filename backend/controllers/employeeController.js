const Employee = require('../models/Employee');
const User = require('../models/User');

// GET /api/employees/me
async function getMyProfile(req, res) {
  const employee = await Employee.findOne({ user: req.user.id }).populate('user', 'employeeCode email role isActive');
  if (!employee) return res.status(404).json({ message: 'Profile not found' });
  res.json(employee);
}

// PUT /api/employees/me  (employee can only edit limited fields)
async function updateMyProfile(req, res) {
  const allowed = ['address', 'phone', 'profilePicUrl'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const employee = await Employee.findOneAndUpdate({ user: req.user.id }, updates, { new: true });
  if (!employee) return res.status(404).json({ message: 'Profile not found' });
  res.json(employee);
}

// GET /api/employees  (admin: list all, with optional search/department filter)
async function listEmployees(req, res) {
  const { search, department } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (search) filter.fullName = { $regex: search, $options: 'i' };

  const employees = await Employee.find(filter).populate('user', 'employeeCode email role isActive');
  res.json(employees);
}

// GET /api/employees/:id (admin: view any employee)
async function getEmployeeById(req, res) {
  const employee = await Employee.findById(req.params.id).populate('user', 'employeeCode email role isActive');
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
}

// PUT /api/employees/:id (admin: edit any field for any employee)
async function updateEmployeeById(req, res) {
  const allowed = [
    'fullName', 'dob', 'address', 'phone', 'profilePicUrl',
    'designation', 'department', 'joiningDate', 'leaveBalance',
  ];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const employee = await Employee.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
}

// PUT /api/employees/:id/status (admin: activate/deactivate the linked user account)
async function setEmployeeActiveStatus(req, res) {
  const { isActive } = req.body;
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });

  const user = await User.findByIdAndUpdate(employee.user, { isActive: !!isActive }, { new: true });
  res.json({ employee, user: user.toSafeJSON() });
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  listEmployees,
  getEmployeeById,
  updateEmployeeById,
  setEmployeeActiveStatus,
};
