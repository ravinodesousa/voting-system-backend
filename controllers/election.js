const model = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Party = model.Party;
const Election = model.Election;
const User = model.Election;
const ElectionResult = model.ElectionResult;
const Vote = model.Vote;

const createElection = async (req, res) => {
  try {
    const newElection = await Election.create({
      name: req?.body?.name,
      startDate: req?.body?.startDate,
      endDate: req?.body?.endDate,
    });
    console.log("newElection", newElection);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const editElection = async (req, res) => {
  try {
    const election = await Election.findOne({ where: { id: req.body?.id } });
    console.log("election", election);

    if (election) {
      election.name = req?.body?.name;
      election.startDate = req?.body?.startDate;
      election.endDate = req?.body?.endDate;

      await election.save();
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const electionList = async (req, res) => {
  try {
    const elections = await Election.findAll();
    console.log("elections", elections);

    return res.status(200).json(elections);
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const electionListWithVotedFlag = async (req, res) => {
  try {
    // let voterId = req.body.userId;
    let voterId = 1;

    const elections = await Election.findAll({
      attributes: {
        include: [
          [
            // Check if voter has already cast a vote
            Sequelize.literal(`(
            SELECT COUNT(*)
            FROM Votes AS vote
            WHERE vote.electionId = Election.id AND vote.voterId = ${voterId}
          )`),
            "hasCastedVote",
          ],
          [
            // Check if the current date is within start and end date
            Sequelize.literal(`(
            CASE 
              WHEN NOW() BETWEEN Election.startDate AND Election.endDate THEN 1
              ELSE 0
            END
          )`),
            "votingAvailable",
          ],
        ],
      },
    });

    // Format elections by converting `hasCastedVote` to a boolean
    elections.map((election) => ({
      ...election.get(),
      hasCastedVote: Boolean(election.get("hasCastedVote")),
      votingAvailable: Boolean(election.get("votingAvailable")),
    }));

    return res.status(200).json(elections);
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const partyList = async (req, res) => {
  try {
    const parties = await Party.findAll();
    console.log("parties", parties);
    return res.status(200).json(parties);
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const addParty = async (req, res) => {
  try {
    const newParty = await Party.create({
      name: req?.body?.name,
    });
    console.log("newParty", newParty);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const editParty = async (req, res) => {
  try {
    const party = await Party.findOne({ where: { id: req.body?.id } });
    console.log("party", party);

    if (party) {
      party.name = req?.body?.name;
      await party.save();
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const editPartyStatus = async (req, res) => {
  try {
    const party = await Party.findOne({ where: { id: req.body?.id } });
    console.log("party", party);

    if (party) {
      party.status = req?.body?.status;
      await party.save();
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const voteHandler = async (req, res) => {
  console.log("req.body", req.body);

  try {
    let voteData = null;
    voteData = await Vote.findOne({
      where: {
        electionId: req.body?.electionId,
        voterId: req.body?.userId,
        candidateId: req.body?.candidateId,
      },
    });
    console.log("voteData", voteData);

    if (voteData) {
      return res.status(500).json({
        error: true,
        message: "Already casted vote for this election",
      });
    }

    voteData = await Vote.create({
      electionId: req.body?.electionId,
      voterId: req.body?.userId,
      candidateId: req.body?.candidateId,
    });

    return res
      .status(200)
      .json({ success: true, message: "Casted vote successfully" });
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json(error);
  }
};

const getElectionResult = async (req, res) => {
  let elections = await Election.findAll({
    // attributes: ["id", "name"], // Select relevant fields from Election
    include: [
      {
        model: ElectionResult,
        as: "results", // Ensure this matches the alias used in Election model
        // include: [
        //   {
        //     model: User,
        //     as: "candidate", // Ensure this matches the alias used in Election model
        //   },
        // ],
      },
    ],
  });

  console.log("elections", elections);

  for (let election of elections) {
    if (election?.results) {
      console.log("election result", election?.results);
      let candidate = await User.findOne({
        where: {
          id: election?.results?.candidateId,
        },
      });

      election.results = { ...election.results, candidate };
    }

    // fetch all candidates and their total votes
    let allVotes = await Vote.findAll({
      attributes: [
        "candidateId",
        [Sequelize.fn("COUNT", Sequelize.col("candidateId")), "totalVotes"],
      ],
      where: { electionId: election.id },
      group: ["candidateId"],
      raw: true,
    });

    for (let vote of allVotes) {
      let candidate = await User.findOne({
        where: {
          id: vote?.candidateId,
        },
      });

      vote = { ...vote, candidate };
    }

    election = { ...election, votes: allVotes };
  }

  console.log("elections 333", elections);

  return res.status(200).json(elections);
};

const closeElection = async () => {
  const elections = await Election.findAll({
    where: {
      status: "ACTIVE",
      endDate: { [Op.lt]: new Date() }, // Checks if endDate is before current date
    },
  });
  console.log("elections", elections);

  for (let election of elections) {
    console.log(election);

    // const votingResults = await Vote.findAll({
    //   attributes: [
    //     "candidateId",
    //     [Sequelize.fn("COUNT", Sequelize.col("candidateId")), "totalVotes"],
    //   ],
    //   where: { electionId:  },
    //   group: ["candidateId"],
    //   raw: true,
    // });

    const topCandidate = await Vote.findOne({
      attributes: [
        "candidateId",
        [Sequelize.fn("COUNT", Sequelize.col("candidateId")), "totalVotes"],
      ],
      where: { electionId: election.id },
      group: ["candidateId"],
      order: [[Sequelize.literal("totalVotes"), "DESC"]],
      limit: 1,
      raw: true,
    });

    console.log("topCandidate", topCandidate);

    if (topCandidate) {
      console.log("topCandidate 3333");

      election.status = "CLOSED";
      await election.save();

      await ElectionResult.create({
        electionId: election.id,
        candidateId: topCandidate?.candidateId,
        totalVotes: topCandidate?.totalVotes,
      });
    }
  }
};

module.exports = {
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
  closeElection,
};
