const model = require("../models");
const User = model.User;
const Party = model.Party;

const getVoters = async (req, res) => {
  try {
    const users = await User.findAll({ where: { user_type: "VOTER" } });
    console.log("users", users);
    return res.status(200).json(users);
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const getCandidates = async (req, res) => {
  try {
    // todo: add party association
    const users = await User.findAll({
      where: { user_type: "CANDIDATE" },
      // include: [
      //   {
      //     model: Party,
      //     as: "party", // Ensure this matches the alias used in
      //   },
      // ],
    });

    console.log("users", users);
    return res.status(200).json(users);
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const getActiveCandidates = async (req, res) => {
  try {
    // todo: add party association
    const users = await User.findAll({
      where: { user_type: "CANDIDATE", status: "ACCEPTED" },
      // include: [
      //   {
      //     model: Party,
      //     as: "party", // Ensure this matches the alias used in
      //   },
      // ],
    });

    console.log("users", users);
    return res.status(200).json(users);
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

module.exports = { getVoters, getCandidates, getActiveCandidates };
