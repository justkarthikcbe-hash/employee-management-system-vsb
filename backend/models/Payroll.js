const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    basic: { type: Number, required: true, default: 0 },
    allowances: { type: Number, required: true, default: 0 },
    deductions: { type: Number, required: true, default: 0 },
    netSalary: { type: Number, required: true, default: 0 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

PayrollSchema.pre('save', function computeNet(next) {
  this.netSalary = (this.basic || 0) + (this.allowances || 0) - (this.deductions || 0);
  next();
});

module.exports = mongoose.model('Payroll', PayrollSchema);
