const express = require("express");
const { userAuth } = require("../middleware/auth");
const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
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

module.exports = profileRouter;
