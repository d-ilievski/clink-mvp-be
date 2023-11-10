const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  profile: { type: Schema.Types.ObjectId, ref: "Profile" },
  platform: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: false },
  active: { type: Boolean, required: true, default: true },
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

module.exports = mongoose.model("Link", schema);
