const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  account: { type: Schema.Types.ObjectId, ref: "Account", default: null },
  connectId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  active: { type: Boolean, required: true, default: true },
  claimDate: { type: Date, default: null },
  created: { type: Date, default: Date.now },
  updated: Date,
});

schema.virtual("isClaimed").get(function () {
  return !!(this.account);
});

module.exports = mongoose.model("Tag", schema);
