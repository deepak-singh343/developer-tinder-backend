const express = require("express");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    //validation of data
    validateSignUpData(req);

    //encrypt password
    const {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
      about,
      skills,
    } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
      about,
      skills,
    });
    await user.save();
    res.send("User added successfully");
  } catch (error) {
    res.status(400).send(`User not added ${error}`);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    } else {
      //create jwt token

      //this jwt token can be moved to user schema
      // const token = await jwt.sign({ _id: user._id }, "deepak@1234", {
      //   expiresIn: "24h", //1d,1h
      // });
      const token = await user.getJWT();

      //add token to cookie and send response back to user
      res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000, //(24 hours in milliseconds)
      });
      res.send("login successfully");
    }
  } catch (error) {
    res.status(400).send(`${error}`);
  }
});

module.exports = authRouter;
