var jwt = require("jsonwebtoken");

const TOKEN_SECRET = "test@123";

module.exports.generateToken = (data) => {
  console.log("Toekn data", data);

  let token = jwt.sign(data, TOKEN_SECRET);
  return token;
};

module.exports.validateToken = (req, res, next) => {
  try {
    console.log("req.headers", req.headers);
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, TOKEN_SECRET);
    const userId = decodedToken?.id;
    console.log("decodedToken", decodedToken);

    if (userId) {
      req.body = {
        ...req.body,
        userId,
      };
      next();
    } else {
      throw "Invalid User";
    }
  } catch (error) {
    console.log("error", error);

    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};
