import  mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    default: 'Approved',
  },
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
  trans: {
    type: String,
    required: true,
  },
  transaction: {
    type: String,
    required: true,
  },
  trxref: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default  Transaction
