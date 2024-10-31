const router = require("express").Router();

const {
  createElection,
  editElection,
  electionList,
  electionListWithVotedFlag,
  partyList,
  addParty,
  editParty,
  editPartyStatus,
  voteHandler,
  getElectionResult,
} = require("../controllers/election");
const { validateToken } = require("../helper/AuthHelper");

router.post("/create", validateToken, createElection);
router.post("/edit", validateToken, editElection);
router.get("/list", validateToken, electionList);
router.get("/voted/list", validateToken, electionListWithVotedFlag);

router.get("/party/list", validateToken, partyList);
router.post("/party/add", validateToken, addParty);
router.post("/party/status/edit", validateToken, editPartyStatus);
router.post("/party/edit", validateToken, editParty);

router.post("/vote", validateToken, voteHandler);
router.get("/result", validateToken, getElectionResult);

module.exports = router;
