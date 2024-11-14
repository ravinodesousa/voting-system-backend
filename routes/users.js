const router = require("express").Router();

const {
  getVoters,
  getCandidates,
  getActiveCandidates,
} = require("../controllers/users");
const { validateToken } = require("../helper/AuthHelper");

router.get("/voters", validateToken, getVoters);
router.get("/candidates", validateToken, getCandidates);
router.get("/candidates/active", validateToken, getActiveCandidates);

module.exports = router;
