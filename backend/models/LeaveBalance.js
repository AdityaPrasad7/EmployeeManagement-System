const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  casual: {
    used: {
      type: Number,
      default: 0
    }
  },
  sick: {
    used: {
      type: Number,
      default: 0
    }
  },
  lop: {
    used: {
      type: Number,
      default: 0
    }
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
leaveBalanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for getting total leave balance
leaveBalanceSchema.virtual('totalBalance').get(function() {
  return {
    used: this.casual.used + this.sick.used + this.lop.used
  };
});

// Method to update leave balance
leaveBalanceSchema.methods.updateBalance = function(type, days) {
  const balance = this[type];
  if (!balance) {
    return false;
  }
  
  balance.used += days;
  return true;
};

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

module.exports = LeaveBalance; 