const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true },
    dob: { type: Date },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    profilePicUrl: { type: String, default: '' },
    designation: { type: String, default: 'Unassigned' },
    department: { type: String, default: 'General' },
    joiningDate: { type: Date, default: Date.now },
    documents: [
      {
        docType: { type: String },
        filePath: { type: String },
        uploadDate: { type: Date, default: Date.now },
      },
    ],
    leaveBalance: {
      paid: { type: Number, default: 12 },
      sick: { type: Number, default: 8 },
      unpaid: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', EmployeeSchema);
