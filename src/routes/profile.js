const express = require("express");
const { userAuth } = require("../middleware/auth");
const { validateProfileData } = require("../utils/validation");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send({
      status: 200,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.status(400).send(`User data not updated ${error}`);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const isUpdateAllowed = validateProfileData(req);
    if (!isUpdateAllowed) {
      res.send({
        status: 400,
        message: "Update not allowed",
      });
      return;
    }
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    const userData = JSON.parse(JSON.stringify(loggedInUser));
    delete userData.password;
    res.send({
      status: 200,
      message: "User data updated successfully",
      data: userData,
    });
  } catch (error) {
    res.status(400).send(`User data not updated ${error}`);
  }
});

module.exports = profileRouter;
