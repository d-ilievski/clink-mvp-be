const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  account: { type: Schema.Types.ObjectId, ref: "Account" },

  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  location: {
    country: { type: String, required: false, trim: true },
    city: { type: String, required: false, trim: true },
  },

  activeProfile: { type: Schema.Types.ObjectId, ref: "Profile" },
  profiles: [{ type: Schema.Types.ObjectId, ref: "Profile" }],

  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  connections: [
    {
      profile: { type: Schema.Types.ObjectId, ref: "Profile" },
      date: { type: Date, default: Date.now },
    },
  ],

  links: [{ type: Schema.Types.ObjectId, ref: "Link" }],

  created: { type: Date, default: Date.now },
  updated: Date,
});

module.exports = mongoose.model("AccountDetails", schema);
