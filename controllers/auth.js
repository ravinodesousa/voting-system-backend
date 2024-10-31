const { Op } = require("sequelize");
const model = require("../models");
const User = model.User;
const Admin = model.Admin;
const bcrypt = require("bcrypt");
const { use } = require("../routes/auth");
var jwt = require("jsonwebtoken");
const { generateToken } = require("../helper/AuthHelper");

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const saltRounds = 10;

const login = async (req, res) => {
  // todo: zod validation for all body params
  //   const users = await User.findAll();

  if (req.body?.email == "" || req.body?.password == "") {
    return res.status(500).json({
      error: true,
      message: "Email and password are mandatory. Please try again.",
    });
  }

  if (!String(req.body?.email).toLowerCase().match(EMAIL_REGEX)) {
    return res.status(500).json({
      error: true,
      message: "Invalid email. Please try again.",
    });
  }

  let user = null,
    userType = "";

  user = await Admin.findOne({ where: { email: req.body?.email } });

  if (!user) {
    user = await User.findOne({ where: { email: req.body?.email } });
    if (user) {
      userType = user?.user_type;
    }
  } else {
    userType = "ADMIN";
  }

  if (user) {
    const result = bcrypt.compareSync(req?.body?.password, user?.password); // true

    if (result) {
      if (
        user?.status == "PENDING" ||
        user?.status == "REJECTED" ||
        user?.status == "BLOCKED"
      ) {
        return res.status(500).json({
          error: true,
          message:
            user?.status == "PENDING"
              ? "User account is currently under review. You will be notified via email once your account is approved."
              : "User account is currently INACTIVE. Check your email for further information",
        });
      }

      user = {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        photo: user?.photo,
      };

      let jwtToken = generateToken(user);

      return res.status(200).json({
        success: true,
        data: { user, userType, jwtToken },
        message: "Logged in successfully",
      });
    }
  }

  return res.status(500).json({
    error: true,
    message: "Email or password doesn't match. Please try again.",
  });
  // Model.findAll({
  //   attributes: ["foo", "bar"],
  // });

  // Post.findAll({
  //   where: {
  //     [Op.and]: [{ authorId: 12 }, { status: "active" }],
  //   },
  // });
};

const signup = async (req, res) => {
  // todo: zod validation for all body params

  if (req.body?.email == "") {
    return res.status(500).json({
      error: true,
      message: "Email is mandatory.",
    });
  }

  if (req.body?.firstName == "") {
    return res.status(500).json({
      error: true,
      message: "First name is mandatory.",
    });
  }

  if (req.body?.lastName == "") {
    return res.status(500).json({
      error: true,
      message: "Last name is mandatory.",
    });
  }

  if (req.body?.password == "") {
    return res.status(500).json({
      error: true,
      message: "Password is mandatory.",
    });
  }

  if (req.body?.cpassword == "") {
    return res.status(500).json({
      error: true,
      message: "Confirm Password is mandatory.",
    });
  }

  if (req.body?.mobNo == "") {
    return res.status(500).json({
      error: true,
      message: "Mobile number is mandatory.",
    });
  }

  if (req.body?.uploadedPhoto == "") {
    return res.status(500).json({
      error: true,
      message: "Photo is mandatory.",
    });
  }

  if (req.body?.gender == "") {
    return res.status(500).json({
      error: true,
      message: "Gender is mandatory.",
    });
  }

  if (req.body?.age == "") {
    return res.status(500).json({
      error: true,
      message: "Age is mandatory.",
    });
  }

  if (req.body?.userType == "") {
    return res.status(500).json({
      error: true,
      message: "User Type not selected.",
    });
  }

  if (req.body?.userType == "CANDIDATE" && req.body?.partyId == "") {
    return res.status(500).json({
      error: true,
      message: "Party not selected.",
    });
  }

  if (!String(req.body?.email).toLowerCase().match(EMAIL_REGEX)) {
    return res.status(500).json({
      error: true,
      message: "Invalid email. Please try again.",
    });
  }

  console.log("request signup", req?.body);
  let user = null;
  // return res.json(req?.body);
  user = await Admin.findOne({ where: { email: req.body?.email } });

  if (!user) {
    user = await User.findOne({ where: { email: req.body?.email } });
  }

  if (req?.body?.password != req?.body?.cpassword) {
    return res.status(500).json({
      error: true,
      message: "Password and Repeat password doesn't match",
    });
  }

  console.log("user found", user);

  if (user) {
    return res
      .status(500)
      .json({ error: true, message: "User with same email already exists" });
  }

  const hashedPassword = bcrypt.hashSync(req?.body?.password, saltRounds);

  const createdUser = await User.create({
    firstName: req?.body?.firstName,
    lastName: req?.body?.lastName,
    email: req?.body?.email,
    mob_no: req?.body?.mobNo,
    photo: req?.body?.uploadedPhoto,
    gender: req?.body?.gender,
    age: req?.body?.age,
    password: hashedPassword,
    user_type: req?.body?.userType,
    partyId: req?.body?.partyId == "" ? null : req?.body?.partyId,
    status: "PENDING",
  });

  if (createdUser) {
    return res.status(200).json({
      success: true,
      message:
        "User account successfully created. You will be notified via email once your account is approved.",
    });
  }
};

const upload = async (req, res) => {
  console.log(req.file?.path);

  return res.status(200).json({ success: true, path: req.file?.path });
  // const user = await User.findOne({ where: { email: req.body?.email } });

  // if (!user) {
  //   const createdUser = await User.create({});
  // }
};

const editUserStatus = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.body?.id } });
    console.log("user", user);

    if (user) {
      // todo: send email
      user.status = req?.body?.status;
      await user.save();
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

module.exports = { login, signup, upload, editUserStatus };
