const mongoose = require("mongoose");

const rowSchema = new mongoose.Schema({
  rowNo: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true }
});


module.exports = mongoose.model("Row", rowSchema);
