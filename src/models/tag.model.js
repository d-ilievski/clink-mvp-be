const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  account: { type: Schema.Types.ObjectId, ref: "Account" },
  type: { type: String, required: true },
  active: { type: Boolean, required: true, default: true },
  created: { type: Date, default: Date.now },
  updated: Date,
});

schema.virtual("isClaimed").get(function () {
  return !!(this.account);
});

module.exports = mongoose.model("Tag", schema);
