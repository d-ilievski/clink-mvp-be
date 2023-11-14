const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  account: { type: Schema.Types.ObjectId, ref: "Account" },

  type: { type: String, required: true, default: "personal" },
  headline: { type: String, required: false },
  description: { type: String, required: false },
  links: [
    {
      link: { type: Schema.Types.ObjectId, ref: "Link" },
      active: { type: Boolean, required: true, default: true },
    }
  ],
  profileSettings: {
    showHeadline: { type: Boolean, required: true, default: true },
    showDescription: { type: Boolean, required: true, default: true },
    showLastName: { type: Boolean, required: true, default: true },
    showLocation: { type: Boolean, required: true, default: true },
    showSaveToContacts: { type: Boolean, required: true, default: true },
  },

  created: { type: Date, default: Date.now },
  updated: Date,
});

module.exports = mongoose.model("Profile", schema);
