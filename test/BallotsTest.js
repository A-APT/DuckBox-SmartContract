const truffleAssert = require('truffle-assertions')
const ballots = artifacts.require("Ballots")

contract("Ballots", function (accounts) {
    let owner = accounts[0]
    let instance = null
    let ballotId = "ballot id"
    let startTime = Math.floor(Date.now() / 1000)
    let endTime = startTime + 100
    let candidates = ["candidate1", "candidate2"]
    let voters = ["voter1", "voter2"]

    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await ballots.new({from: owner});

        // assert
        assert.equal(await instance.owner(), owner);
    })
    it("is_registerBallot_and_getBallot_works_well", async () => {
        // arrange
        let chairperson = accounts[1]

        // act
        await instance.registerBallot(
            ballotId, candidates, true, startTime, endTime, voters,
            {from: chairperson}
        )
        await instance.getBallot(ballotId)
    })
    it("is_registerBallot_reverts_duplicate_ballot", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.registerBallot(
                ballotId, candidates, true, startTime, endTime, voters
            ),
            "Already registered ballot (id)."
        );
    })
    it("is_getBallot_reverts_invalid_ballotId", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.getBallot("invalid ballot id"),
            "Unregistered ballot (id)."
        );
    })
})
