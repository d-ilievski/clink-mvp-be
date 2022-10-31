const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  account: { type: Schema.Types.ObjectId, ref: "Account" },
  handle: { type: String, required: false },
  title: { type: String, required: false },
  description: { type: String, required: false },
  links: [{ type: Schema.Types.ObjectId, ref: "Link" }],
  // connections: [{ type: Schema.Types.ObjectId, ref: "Account" }],
  created: { type: Date, default: Date.now },
  updated: Date,
});

// schema.set("toJSON", {
//   virtuals: true,
//   versionKey: false,
//   transform: function (doc, ret) {
//     // remove these props when object is serialized
//     delete ret._id;
//     delete ret.passwordHash;
//   },
// });

module.exports = mongoose.model("Profile", schema);
