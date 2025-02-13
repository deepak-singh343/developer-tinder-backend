const express = require("express");
const connectDB = require("./config/database");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const { validateSignUpData } = require("./utils/validation");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middleware/auth");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// app.post("/signup", async (req, res) => {  moved to routes
//   try {
//     //validation of data
//     validateSignUpData(req);

//     //encrypt password
//     const {
//       firstName,
//       lastName,
//       emailId,
//       password,
//       age,
//       gender,
//       about,
//       skills,
//     } = req.body;
//     const passwordHash = await bcrypt.hash(password, 10);
//     const user = new User({
//       firstName,
//       lastName,
//       emailId,
//       password: passwordHash,
//       age,
//       gender,
//       about,
//       skills,
//     });
//     await user.save();
//     res.send("User added successfully");
//   } catch (error) {
//     res.status(400).send(`User not added ${error}`);
//   }
// });

// app.post("/login", async (req, res) => {
//   try {
//     const { emailId, password } = req.body;
//     const user = await User.findOne({ emailId });
//     if (!user) {
//       throw new Error("Invalid credentials");
//     }
//     const isPasswordValid = await user.validatePassword(password);
//     if (!isPasswordValid) {
//       throw new Error("Invalid credentials");
//     } else {
//       //create jwt token

//       //this jwt token can be moved to user schema
//       // const token = await jwt.sign({ _id: user._id }, "deepak@1234", {
//       //   expiresIn: "24h", //1d,1h
//       // });
//       const token = await user.getJWT();

//       //add token to cookie and send response back to user
//       res.cookie("token", token, {
//         maxAge: 24 * 60 * 60 * 1000, //(24 hours in milliseconds)
//       });
//       res.send("login successfully");
//     }
//   } catch (error) {
//     res.status(400).send(`${error}`);
//   }
// });

// app.get("/feed", userAuth, async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.send({
//       status: 200,
//       data: users,
//       message: "Users fetched successfully",
//     });
//   } catch (error) {
//     res.status(400).send(`User not added ${error}`);
//   }
// });

// app.get("/user", userAuth, async (req, res) => {
//   try {
//     const userEmail = req.body.emailId;
//     const user = await User.findOne({ emailId: userEmail });
//     if (!user) {
//       res.send({
//         status: 400,
//         message: "User not found",
//       });
//     } else {
//       res.send({
//         status: 200,
//         data: user,
//         message: "User fetched successfully",
//       });
//     }
//   } catch (error) {
//     res.status(400).send(`User not added ${error}`);
//   }
// });

// app.delete("/user", userAuth, async (req, res) => {
//   try {
//     const userId = req.body.userId;

//     // await User.findByIdAndDelete(userId); or

//     await User.findByIdAndDelete({ _id: userId });
//     res.send({
//       status: 200,
//       message: "User removed from db successfully",
//     });
//   } catch (error) {
//     res.status(400).send(`User not added ${error}`);
//   }
// });

// app.patch("/user/:userId", userAuth, async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const userData = req.body;
//     const allowedUpdates = ["photoUrl", "about", "age", "skills"];
//     const isUpdateAllowed = Object.keys(userData).every((key) =>
//       allowedUpdates.includes(key)
//     );
//     if (!isUpdateAllowed) {
//       res.send({
//         status: 400,
//         message: "Update not allowed",
//       });
//       return;
//     }
//     await User.findByIdAndUpdate({ _id: userId }, userData);
//     res.send({
//       status: 200,
//       message: "User data updated successfully",
//     });
//   } catch (error) {
//     res.status(400).send(`User data not updated ${error}`);
//   }
// });

// app.get("/profile", userAuth, async (req, res) => {
//   try {
//     const user = req.user;
//     res.send({
//       status: 200,
//       data: user,
//       message: "User fetched successfully",
//     });
//   } catch (error) {
//     res.status(400).send(`User data not updated ${error}`);
//   }
// });
app.use("/", authRouter);
app.use("", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
connectDB()
  .then(() => {
    console.log("Connection established successfully");
    app.listen(3000, () => {
      console.log(`server is running on port 3000`);
    });
  })
  .catch((error) => {
    console.log("Connection failed");
  });
