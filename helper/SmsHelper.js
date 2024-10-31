const axios = require("axios").default;

module.exports.sendOTP = (phoneNo, message) => {
  params = {
    apikey: "NzA1Mjc5NTAzOTQ3MzI0ZTc5NDE3YTU4NjkzNDZkNTU=",
    numbers: "91" + phoneNo,
    message: message,
    sender: "MLNWYS",
  };

  axios
    .get(
      `https://api.textlocal.in/send/?apikey=${params.apikey}&numbers=${params.numbers}&sender=${params.sender}&message=${params.message}`
    )
    .then((data) => {
      console.log(data);
    });
};
