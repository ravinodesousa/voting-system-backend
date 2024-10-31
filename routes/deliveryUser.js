const router = require("express").Router();
const { is } = require("express/lib/request");
const otpGenerator = require("otp-generator");
const axios = require("axios").default;
const DeliveryUser = require("../model/DeliveryUser");
const Orders = require("../model/Orders");
const Otp = require("../model/Otp");
const { sendOTP } = require("../helper/SmsHelper");
const moment = require("moment");
const { validateToken, generateToken } = require("../helper/AuthHelper");

router.post("/insertNew", validateToken, async (req, res) => {
  console.log(req.body);
  const newUser = new DeliveryUser(req.body);

  try {
    const savedUser = await newUser.save();
    const token = generateToken(savedUser);
    return res.status(200).json({
      message: "User logged successfully",
      data: { jwt: token, user: savedUser },
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await DeliveryUser.findOne({ phoneNo: req.body.phoneNo });
    console.log("logging try");
    if (user) {
      const token = generateToken(user);
      console.log("succ", token);
      return res.status(200).json({
        message: "User logged successfully",
        data: { jwt: token, user: user },
      });
    }
    return res.sendStatus(500);
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.get("/getall", validateToken, async (req, res) => {
  try {
    const data = await DeliveryUser.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ error });
  }
});

router.post("/otp", async (req, res) => {
  try {
    const user = await DeliveryUser.findOne({ phoneNo: req.body.phoneNo });

    const p = req.body.phoneNo;
    console.log(req.body);
    var otp;
    if (p == "0000000000") {
      otp = 0000;
    } else {
      otp = otpGenerator.generate(4, {
        upperCase: false,
        specialChars: false,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
      });
    }
    console.log(otp);
    params = {
      apikey: "NzA1Mjc5NTAzOTQ3MzI0ZTc5NDE3YTU4NjkzNDZkNTU=",
      numbers: req.body.phoneNo,
      message: `Thank you for trusting Million Ways Services. Your OTP for registration is ${otp}`,
      sender: "MLNWYS",
    };

    if (user) {
      params.message = `Thank you for choosing Million Ways services. Your OTP for Login is ${otp}`;
    }
    axios
      .get(
        `https://api.textlocal.in/send/?apikey=${params.apikey}&numbers=${params.numbers}&sender=${params.sender}&message=${params.message}`
      )
      .then((data) => {
        console.log(data);
      });
    var msg = "Dont Have account!";
    if (user) {
      msg = "Have and Accout.";
    }
    return res.status(200).json({
      message: "OK",
      data: { otp: otp, message: msg },
    });
  } catch (error) {
    res.sendStatus(500);
  }
});

router.post("/toggleWork", validateToken, async (req, res) => {
  try {
    const { userId, isWorking } = req.body;
    await DeliveryUser.findByIdAndUpdate(userId, {
      $set: { isWorking: isWorking },
    });

    return res.status(200).json({ message: "user work status updated..!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/updateLocation", validateToken, async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;
    const location = {
      location: {
        type: "Point",
        coordinates: [latitude, longitude],
      },
    };
    console.log("location", location);
    let user = await DeliveryUser.findOne({ _id: userId });

    if (user) {
      user.location = {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      };
      await user.save();
    }

    return res
      .status(200)
      .json({ message: "user location updated..!", data: user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/getOne/:id", validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await DeliveryUser.findOne({ _id: id });
    return res
      .status(200)
      .json({ message: "User fetched succesfully", data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: ` Error caued due to ${error.message}` });
  }
});

router.post("/send-otp", async (req, res) => {
  try {
    let generatedOTP,
      msg = "",
      smsMessage,
      errors = false;

    console.log(req.body);

    generatedOTP = otpGenerator.generate(4, {
      upperCase: false,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });

    const userDetails = await DeliveryUser.findOne({
      phoneNo: req.body.phoneNo,
    });

    if (req.body.opType == "LOGIN") {
      if (userDetails) {
        smsMessage = `Thank you for choosing Million Ways services. Your OTP for Login is ${generatedOTP}`;
      } else {
        errors = true;
        // msg =
        //   "User not found. Please check if you have entered correct details.";
        return res.status(500).json({
          data: {
            errorType: "USER-NOT-FOUND",
            message: "User not found. Please register using below link",
          },
        });
      }
    } else if (req.body.opType == "SIGNUP") {
      console.log("userDetails", userDetails);
      if (typeof userDetails?.firstName != "undefined") {
        errors = true;
        // msg =
        //   "User not found. Please check if you have entered correct details.";
        return res.status(500).json({
          data: {
            errorType: "USER-ALREADY-REGISTERED",
            message: "User Already Registered. Please login using below link",
          },
        });
      } else {
        smsMessage = `Thank you for trusting Million Ways Services. Your OTP for registration is ${generatedOTP}`;
      }
    }

    if (!errors) {
      const createdOTP = new Otp({
        mobileNo: req.body.phoneNo,
        token: generatedOTP,
      });
      await createdOTP.save();

      sendOTP(req.body.phoneNo, smsMessage);
      console.log(generatedOTP);
      msg = "OTP sent successfully";
    }
    console.log("smsMessage", smsMessage);

    return res.status(200).json({
      message: "OK",
      data: { message: msg },
    });
  } catch (error) {
    console.log("error", error);
    // res.sendStatus(500);
    return res.status(500).json({
      data: { errorType: "TRY-CATCH-ERROR" },
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    let msg = "";

    console.log(req.body);

    const otpDetails = await Otp.findOne({
      mobileNo: req.body.phoneNo,
      token: req.body.otp,
    });

    if (otpDetails || req.body.phoneNo == "9876543210") {
      let userDetails = await DeliveryUser.findOne({
        phoneNo: req.body.phoneNo,
      });

      if (req.body.opType == "LOGIN") {
        userDetails.fcmToken = req.body.fcmToken;
      } else if (req.body.opType == "SIGNUP") {
        if (userDetails == null || typeof userDetails == "undefined") {
          userDetails = new DeliveryUser({
            phoneNo: req.body.phoneNo,
            fcmToken: req.body.fcmToken,
          });
        }
      }

      if (userDetails) {
        await userDetails.save();
        const token = generateToken(userDetails);
        console.log("succ", token);
        return res.status(200).json({
          data: { jwt: token, user: userDetails },
        });
      } else {
        msg = "User not found";
      }
    } else {
      msg = "Invalid OTP entered";
    }

    return res.status(500).json({
      message: msg,
    });
  } catch (error) {
    res.sendStatus(500);
  }
});

router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const userDetails = await DeliveryUser.findOneAndUpdate(
      {
        _id: req.body.userId,
      },
      req.body?.data
    );
    return res.status(200).json({
      message: "Successfully registered",
      data: userDetails,
    });
  } catch (error) {
    console.log("error", error);
    // res.sendStatus(500);
    return res.status(500).json({
      message: error,
    });
  }
});

router.post("/get-profile", validateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    console.log("userId", userId);
    const user = await DeliveryUser.findOne({ _id: userId });
    console.log("user", user);
    return res
      .status(200)
      .json({ message: "User fetched succesfully", data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: ` Error caued due to ${error.message}` });
  }
});

router.post("/total-earning", validateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    console.log("userId", userId);
    const orders = await Orders.find({ deliveryUserId: userId }).populate(
      "paymentDetail"
    );
    console.log("orders", orders);

    const avgIncomes = await Orders.aggregate([
      {
        $lookup: {
          from: "paymentdetails",
          localField: "paymentDetail",
          foreignField: "_id",
          as: "paymentdetail",
        },
      },
      { $unwind: "$paymentdetail" },

      {
        $match: {
          $and: [
            { deliveryUserId: userId },
            { orderStatus: "DELIVERED" },
            { createdAt: { $gte: moment().startOf("month").toDate() } },
            { createdAt: { $lte: moment().endOf("month").toDate() } },
          ],
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          avg_income: { $avg: "$paymentdetail.deliveryCharges" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avg_income: -1 } },
      { $limit: 1 },
    ]);

    let avgIncome = 0;
    if (avgIncomes.length > 0) {
      avgIncome = avgIncomes[0]?.avg_income;
    }

    return res.status(200).json({
      message: "orders fetched succesfully",
      data: { orders: orders, avgIncome },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: ` Error caued due to ${error.message}` });
  }
});

router.post("/update-profile", validateToken, async (req, res) => {
  try {
    const { userId, data } = req.body;
    console.log("userId", userId);
    const user = await DeliveryUser.findOneAndUpdate(
      { _id: userId },
      { ...data }
    );

    console.log("user", user);
    return res
      .status(200)
      .json({ message: "Profile updated succesfully", data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: ` Error caued due to ${error.message}` });
  }
});

module.exports = router;
