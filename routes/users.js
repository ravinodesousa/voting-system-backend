const router = require("express").Router();

const { getVoters, getCandidates } = require("../controllers/users");
const { validateToken } = require("../helper/AuthHelper");

router.get("/voters", validateToken, getVoters);
router.get("/candidates", validateToken, getCandidates);

module.exports = router;
