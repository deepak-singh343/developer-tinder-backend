const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const authRouter = require("./auth");
const User = require("../models/user");
const userRouter = express.Router();

const USER_SAFE_FIELDS = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "about",
  "skills",
  "photoUrl",
];

//get all the pending connection requests for the logged in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_FIELDS);
    //or second parameter is for filtering the fields
    //   .populate("fromUserId", "firstName lastName");
    res.send({
      data: connectionRequests,
      message: "Connection requests fetched successfully",
    });
  } catch (error) {
    res.status(400).send(`Error`);
  }
});

//get all the pending connection requests for the logged in user
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequestModel.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .populate("toUserId", USER_SAFE_FIELDS);
    //or second parameter is for filtering the fields
    //   .populate("fromUserId", "firstName lastName");
    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.send({
      data: data,
      message: "Connection requests fetched successfully",
    });
  } catch (error) {
    res.status(400).send(`Error`);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    //user should see all users cards except:
    //1. his own card
    //2. his connections
    //3. ignored people
    //4. already sent connection request
    const pageNumber = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const loggedInUser = req.user;
    //connection request sent or received
    const connectionRequests = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    })
      .select("fromUserId toUserId")
      .populate("fromUserId", "firstName")
      .populate("toUserId", "firstName");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId._id.toString());
      hideUsersFromFeed.add(req.toUserId._id.toString());
    });
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_FIELDS)
      .skip((pageNumber - 1) * limit)
      .limit(limit);

    res.send({
      data: users,
      message: "Connection requests fetched successfully",
    });
  } catch (error) {
    res.status(400).send(`Error ${error}`);
  }
});
module.exports = userRouter;
