const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/testDB');

const UserSchema = new mongoose.Schema({
  username: {
      type: String, 
      required: true,
  },
  password: {
      type: String, 
      required: true,
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;