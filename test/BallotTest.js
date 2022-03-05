const truffleAssert = require('truffle-assertions')
const ballot = artifacts.require("Ballot")

contract("Ballot", function (accounts) {
    const candidate1 = "0x53696c7665720000000000000000000000000000000000000000000000000000";
    const voter1 = "je"
    const voter2 = "apt"

    it("is_constructor_works_well", async function () {
        // arrange
        let instance = await ballot.deployed();
        let status = await instance.status();
        let chairperson = await instance.chairperson();

        // assert
        assert.equal(chairperson.valueOf(), accounts[0], "accounts[0] wasn't the contract owner(chairperson).")
        assert.equal(status, 0) // BallotStatus.OPEN
    })
    it("is_candidates_not_works_well", async () => {
        // arrange
        let instance = await ballot.deployed();

        // act, assert: check fail at call candidates (it is private)
        try {
            await instance.candidates(candidate1)
            assert.fail("This should be failed...")
        } catch (e) {
            assert.equal(e instanceof TypeError, true)
            assert.equal(e.message, "instance.candidates is not a function")
        }
    })
    it("is_resultOfBallot_reverts_on_not_finished", async () => {
        // arrange
        let instance = await ballot.deployed();

        // act, assert: check revert when not FINISHED status
        await truffleAssert.reverts(
            instance.resultOfBallot(),
            "This function is restricted only at FINISHED status."
        );
    })

    it("is_giveRightToVoters_works_well", async () => {
        // arrange
        let instance = await ballot.deployed();

        // act
        let voters = [voter1, voter2]
        await instance.giveRightToVoters(voters)

        // assert
        for (const voter of voters) {
            let v = await instance.voters(voter)
            assert.equal(v.right, true)
            assert.equal(v.voted, false)
        }
        // check status is ONGOING
        let status = await instance.status();
        assert.equal(status, 1) // BallotStatus.ONGOING
    })
    it("is_giveRightToVoters_reverts_on_not_chairperson", async () => {
        // arrange
        let instance = await ballot.deployed();
        let notOwner = accounts[1];

        // act, assert: check revert when not owner(chairperson)
        await truffleAssert.reverts(
            instance.giveRightToVoters(["new voter"], {from: notOwner}),
            "Only chairperson can give right to vote."
        );
    })
    it("is_giveRightToVoters_reverts_on_called_twice", async () => {
        // arrange
        let instance = await ballot.deployed();

        // act, assert: check revert when call twice
        await truffleAssert.reverts(
            instance.giveRightToVoters(["new voter"]),
            "This function can only be called once."
        );
    })

    it("is_close_works_well", async () => {
        // arrange
        let instance = await ballot.deployed();

        // act
        await instance.close();

        // aseert
        // check status is FINISHED
        let status = await instance.status();
        assert.equal(status, 2) // BallotStatus.FINISHED
    })
    it("is_close_reverts_when_not_chairperson", async () => {
        // arrange
        let instance = await ballot.deployed();
        let notOwner = accounts[1];

        // act, assert: check revert when not owner(chairperson)
        await truffleAssert.reverts(
            instance.close({from: notOwner}),
            "Only chairperson can close this ballot."
        );
    })

    it("is_resultOfBallot_works_well", async () => {
        // arrange
        let instance = await ballot.deployed();

        // act
        let result = await instance.resultOfBallot();

        // assert
        assert.equal(result.length, 1, "number of candidate is wrong.")
        assert.equal(result[0].name, candidate1, "candidate name is wrong.")
        assert.equal(result[0].voteCount, 0, "voteCount is wrong.")
    })
})
