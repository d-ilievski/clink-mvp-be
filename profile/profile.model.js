const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  account: { type: Schema.Types.ObjectId, ref: "Account" },
  description: { type: String, required: false },
  links: [{ type: Schema.Types.ObjectId, ref: "Link" }],
  connections: [
    {
      profile: { type: Schema.Types.ObjectId, ref: "Profile" },
      date: { type: Date, default: Date.now },
    },
  ],
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
