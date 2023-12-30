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
  anonymousConnections: [
    {
      firstName: { type: String, required: true, trim: true },
      links: [{
        type: { type: String, required: true },
        platform: { type: String, required: true },
        value: { type: String, required: true },
      }],
      date: { type: Date, default: Date.now },
    }
  ],

  created: { type: Date, default: Date.now },
  updated: Date,
});

schema.virtual("totalConnections").get(function () {
  return this.connections?.length || null;
});

schema.virtual("totalAnonymousConnections").get(function () {
  return this.anonymousConnections?.length || null;
});

module.exports = mongoose.model("AccountDetails", schema);
