const truffleAssert = require('truffle-assertions');
const ballot = artifacts.require("Ballot");
const ethers = require('ethers');

const candidates = ["candidate1", "candidate2"];
const voters = [ethers.utils.formatBytes32String("voter1"), ethers.utils.formatBytes32String("voter2")];
const REGISTERED = 0;
const OPEN = 1;
const CLOSE = 2;
const publicKeyX =  BigInt("0x6247d87a95d3f4ebeaf4c7ab79b9d9e9ef5b7c7f4c37c41f645c57e1e2f24631");
const publicKeyY =  BigInt("0x6247d87a95d3f4ebeaf4c7ab79b9d9e9ef5b7c7f4c37c41f645c57e1e2f24631");

contract("Ballot_official", function (accounts) {
    let instance = null;
    let startTime = Math.floor(Date.now() / 1000) + 2;
    let endTime = startTime + 40;
    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime, voters); // official ballot
        console.log(voters);
        // assert
        let chairperson = await instance.chairperson();
        assert.equal(chairperson.valueOf(), accounts[0], "accounts[0] wasn't the contract owner(chairperson).");
        assert.equal(await instance.status(), REGISTERED);
        assert.equal(await instance.isOfficial(), true);
        assert.equal(await instance.startTime(), startTime);
        assert.equal(await instance.endTime(), endTime);

        for (const voter of voters) {
            let v = await instance.voters(voter)
            assert.equal(v.right, true)
            assert.equal(v.voted, false)
        }
    });

    it("is_candidates_not_works_well", async () => {
        // act, assert: check fail at call candidates (it is private)
        try {
            await instance.candidates(candidates[0]);
            assert.fail("This should be failed...");
        } catch (e) {
            assert.equal(e instanceof TypeError, true);
            assert.equal(e.message, "instance.candidates is not a function");
        }
    });

    it("is_resultOfBallot_reverts_on_not_closed", async () => {
        // act, assert: check revert when not CLOSE status
        await truffleAssert.reverts(
            instance.resultOfBallot(),
            "This function is restricted only at CLOSE status."
        );
    });

    it("is_vote_reverts_not_on_open", async () => {
        // act, assert: check revert when not OPEN status
        await truffleAssert.reverts(
            instance.vote(0, ethers.utils.formatBytes32String("anyone")),
            "Vote is allowed at Ballot is OPEN."
        );
    });

    it("is_close_reverts_not_on_OPEN", async () => {
        // act, assert: check revert when not on OPEN status
        await truffleAssert.reverts(
            instance.close(),
            "This function can be called only at OPEN status."
        );
    });

    it("is_open_works_well", async () => {
        // wait 3000ms
        await new Promise(resolve => setTimeout(resolve, 3000));

        // act
        await instance.open();

        // assert
        assert.equal(await instance.status(), OPEN);
    });

    it("is_open_reverts_not_on_REGISTRED", async () => {
        // arrange
        let tempInstance = await ballot.deployed(candidates, true, Date.now() + 10, Date.now() + 100, voters); // official ballot
        let notOwner = accounts[1];

        // act, assert: check revert when not on REGISTERED status
        await truffleAssert.reverts(
            instance.open(),
            "This function can be called only at REGISTERED status."
        );
    });

    it("is_vote_works_well", async () => {
        // arrange
        let notOwner = accounts[2];

        // act
        await instance.vote(0, voters[0], {from: notOwner});

        // assert
        let voter = await instance.voters(voters[0]);
        assert.equal(voter.right, true);
        assert.equal(voter.voted, true);

        // TODO check candidate voteCount: ?
    });

    it("is_vote_reverts_when_already_voted", async () => {
        // act, assert: check revert when already voted voter
        await truffleAssert.reverts(
            instance.vote(0, voters[0]),
            "Already voted."
        );
    });

    it("is_vote_reverts_when_no_right_to_vote", async () => {
        // act, assert: check revert when no right to vote
        await truffleAssert.reverts(
            instance.vote(0, ethers.utils.formatBytes32String("anyone")),
            "Has no right to vote."
        );
    });

    it("is_vote_reverts_when_invalid_candidate", async () => {
        // act, assert: check revert when already voted voter
        await truffleAssert.reverts(
            instance.vote(2, voters[1])
        );
    });

    it("is_close_reverts_before_endTime", async () => {
        // act, assert: check revert when not owner(chairperson)
        await truffleAssert.reverts(
            instance.close(),
            "Before the end time."
        );
        assert.equal(await instance.status(), OPEN);
    });

    it("is_close_and_resultOfBallot_works_well", async () => {
        // wait 30000ms
        await new Promise(resolve => setTimeout(resolve, 30000));

        // act
        await instance.close();
        let result = await instance.resultOfBallot();

        // aseert
        let status = await instance.status();
        assert.equal(status, CLOSE); // check status is CLOSE

        assert.equal(result.length, 2, "number of candidate is wrong.");
        assert.equal(result[0].name, candidates[0], "candidate name is wrong.");
        assert.equal(result[0].voteCount, 1, "voteCount is wrong.");
    });
});

contract("Ballot_status", function (accounts) {
    it("is_constructor_works_well_on_after_startTime", async () => {
        // arrange & act
        let startTime = Math.floor(Date.now() / 1000) - 10;
        let endTime = Math.floor(Date.now() / 1000) + 10;
        let instance = await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime, voters);

        // assert
        let status = await instance.status();
        assert.equal(status, OPEN); // check status is OPEN
    });

    it("is_constructor_reverts_when_endTime_is_earlier_than_startTime", async function () {
        // arrange
        let startTime = Math.floor(Date.now() / 1000) + 500;
        let endTime = startTime - 100;

        // act & assert
        try {
            await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime, voters);
            assert.fail("This should be failed...");
        } catch (e) {
            assert.equal(e.message, "Returned error: base fee exceeds gas limit -- Reason given: The start time must be earlier than the end time..");
        }
    });

    it("is_constructor_reverts_when_endTime_is_earlier_than_now", async function () {
        // arrange
        let endTime = Math.floor(Date.now() / 1000) - 100;
        let startTime = endTime - 100;

        // act & assert
        try {
            await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime, voters);
            assert.fail("This should be failed...");
        } catch (e) {
            assert.equal(e.message, "Returned error: base fee exceeds gas limit -- Reason given: The start time must be earlier than the end time..");
        }
    });

    it("is_open_reverts_before_startTime", async function () {
        // arrange
        let startTime = Math.floor(Date.now() / 1000) + 100;
        let endTime = startTime + 200;
        let instance = await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime, voters);

        // assert
        await truffleAssert.reverts(
            instance.open(),
            "Before the start time."
        );
    });
});

contract("Ballot_community", function (accounts) {
    let instance = null;
    let startTime = Math.floor(Date.now() / 1000);
    let endTime = startTime + 100;

    it("is_constructor_works_well", async function () {
        // arrange
        // get instance first
        instance = await ballot.new(publicKeyX, publicKeyY, candidates, false, startTime, endTime, voters);

        // assert
        let chairperson = await instance.chairperson();
        assert.equal(chairperson.valueOf(), accounts[0], "accounts[0] wasn't the contract owner(chairperson).");
        assert.equal(await instance.status(), OPEN);
        assert.equal(await instance.isOfficial(), false);
        assert.equal(await instance.startTime(), startTime);
        assert.equal(await instance.endTime(), endTime);

        // check voters info is discarded - since this is community ballot
        for (const voter of voters) {
            let v = await instance.voters(voter);
            assert.equal(v.right, false);
        }
    });

    it("is_vote_works_well", async () => {
        // act
        let user = ethers.utils.formatBytes32String("user");
        await instance.vote(0, user);

        // assert
        let voter = await instance.voters(user);
        assert.equal(voter.right, false);
        assert.equal(voter.voted, true);

        // TODO check candidate voteCount: ?
    });
});
