const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  account: { type: Schema.Types.ObjectId, ref: "Account" },

  type: { type: String, required: true, default: "personal" },
  headline: { type: String, required: false, default: "" },
  description: { type: String, required: false, default: "" },
  links: [
    {
      link: { type: Schema.Types.ObjectId, ref: "Link" },
      active: { type: Boolean, required: true, default: true },
    }
  ],
  profileSettings: {
    showHeadline: { type: Boolean, required: false, default: true },
    showDescription: { type: Boolean, required: false, default: true },
    showLastName: { type: Boolean, required: false, default: true },
    showLocation: { type: Boolean, required: false, default: true },
    showSaveToContacts: { type: Boolean, required: false, default: true },
  },

  created: { type: Date, default: Date.now },
  updated: Date,
});

module.exports = mongoose.model("Profile", schema);
