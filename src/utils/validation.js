const validator = require("validator");
const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (firstName.length < 2 || firstName.length > 50) {
    throw new Error("firstName invalid");
  }
  if (!validator.isEmail(emailId)) {
    throw new Error("Email id not valid");
  }
  //   if (!validator.isStrongPassword(password)) {
  //     throw new Error("Password is not strong");
  //   }
};

module.exports = {
  validateSignUpData,
};
