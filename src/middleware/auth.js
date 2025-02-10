const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid token!!!");
    }
    const decodedMessage = await jwt.verify(token, "deepak@1234");
    const { _id } = decodedMessage;
    const user = await User.findById({ _id });
    if (!user) {
      throw new Error("User not found");
    } else {
      req.user = user;
      next();
    }
  } catch (error) {
    res.status(400).send("Error" + error);
  }
};

module.exports = { userAuth };
