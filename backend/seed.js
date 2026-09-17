require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Employee = require('./models/Employee');

async function run() {
  await connectDB();

  const existingAdmin = await User.findOne({ email: 'admin@dayflow.com' });
  if (!existingAdmin) {
    const admin = new User({ employeeCode: 'ADM001', email: 'admin@dayflow.com', role: 'admin' });
    await admin.setPassword('Admin@123');
    await admin.save();
    await new Employee({
      user: admin._id,
      fullName: 'Priya Sharma',
      designation: 'HR Manager',
      department: 'Human Resources',
    }).save();
    console.log('Created admin: admin@dayflow.com / Admin@123');
  } else {
    console.log('Admin already exists, skipping.');
  }

  const existingEmp = await User.findOne({ email: 'employee@dayflow.com' });
  if (!existingEmp) {
    const emp = new User({ employeeCode: 'EMP001', email: 'employee@dayflow.com', role: 'employee' });
    await emp.setPassword('Employee@123');
    await emp.save();
    await new Employee({
      user: emp._id,
      fullName: 'Arjun Mehta',
      designation: 'Software Engineer',
      department: 'Engineering',
    }).save();
    console.log('Created employee: employee@dayflow.com / Employee@123');
  } else {
    console.log('Demo employee already exists, skipping.');
  }

  console.log('Seed complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
