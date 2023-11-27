const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  account: { type: Schema.Types.ObjectId, ref: "Account" },

  type: { type: String, required: true },
  platform: { type: String, required: true },
  value: { type: String, required: true },
  displayName: { type: String, required: false },
  active: { type: Boolean, required: true, default: true },

  created: { type: Date, default: Date.now },
  updated: Date,
});

module.exports = mongoose.model("Link", schema);
