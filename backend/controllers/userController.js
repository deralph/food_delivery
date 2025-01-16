import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// login user

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Doesn't exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const role = user.role;
    const token = createToken(user._id);
    res.json({ success: true, token, role });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Create token

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// register user

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);

  try {
    // checking if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format and strong password
    try {
      if (!validator.isEmail(email)) {
        return res.json({
          success: false,
          message: "Please enter a valid email",
        });
      }
    } catch (emailValidationError) {
      console.log("Error in email validation:", emailValidationError);
      return res.json({ success: false, message: "Invalid email format" });
    }

    try {
      if (password.length < 8) {
        return res.json({
          success: false,
          message: "Please enter a strong password",
        });
      }
    } catch (passwordValidationError) {
      console.log("Error in password validation:", passwordValidationError);
      return res.json({
        success: false,
        message: "Password validation failed",
      });
    }

    console.log("hashing next");

    // hashing user password
    try {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("password hashed");

      const newUser = new userModel({
        name: name,
        email: email,
        password: hashedPassword,
      });

      const user = await newUser.save();
      const role = user.role;
      const token = createToken(user._id);
      console.log("user created successfully");

      res.json({ success: true, token, role });
    } catch (hashingError) {
      console.log("Error hashing the password:", hashingError);
      return res.json({ success: false, message: "Error hashing password" });
    }
  } catch (error) {
    console.log("user not created successfully");
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { loginUser, registerUser };
