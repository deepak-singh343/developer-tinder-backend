const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");
const requestRouter = express.Router();

const sendEmail = require("../utils/sendEmail");

requestRouter.post(
  "/request/send/:status/:toUserId", //interested or ignored
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        res.send({
          status: 400,
          message: "Invalid status",
        });
        return;
      }

      const existingToUser = await User.findById(toUserId);
      if (!existingToUser) {
        res.send({
          status: 400,
          message: "User not found",
        });
        return;
      }

      // if there is existing request from fromUserID to toUserId
      const existingRequest = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingRequest) {
        res.send({
          status: 400,
          message: "Request already exists",
        });
        return;
      }
      const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });
      const mailRes = await sendEmail.run();
      const data = await connectionRequest.save();

      res.send({
        status: 200,
        data,
        message:
          status == "interested"
            ? `Connection request sent successfully to ${existingToUser.firstName} ${existingToUser.lastName}`
            : `Connection request to ${existingToUser.firstName} ${existingToUser.lastName} is ignored`,
      });
    } catch (error) {
      res.status(400).send(`Error ${error}`);
    }
  }
);

//only interested request can be reviewed(accepted or rejected)
//for post requests always validate data since attacker can insert any data in our db
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const requestId = req.params.requestId;
      const status = req.params.status;

      const allowedStatus = ["rejected", "accepted"];
      if (!allowedStatus.includes(status)) {
        return res.send({
          status: 400,
          message: "Invalid status",
        });
      }

      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested", //only interested request can be reviewed
      });
      if (!connectionRequest) {
        res.send({
          status: 400,
          message: "Connect request not found",
        });
        return;
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.send({
        status: 200,
        data,
        message: `Connection request ${status}`,
      });
    } catch (error) {
      res.status(400).send(`Error ${error}`);
    }
  }
);
module.exports = requestRouter;
