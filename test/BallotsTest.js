const truffleAssert = require('truffle-assertions');
const ballots = artifacts.require("Ballots");
const decentralizedId = artifacts.require("DecentralizedId");
const ethers = require('ethers');

contract("Ballots", function (accounts) {
    let owner = accounts[0];
    let instance = null;
    let didInstance = null;

    let ballotId = "ballot id";
    let startTime = Math.floor(Date.now() / 1000);
    let endTime = startTime + 100;
    let candidates = ["candidate1", "candidate2"];
    let voters = [ethers.utils.formatBytes32String("voter1"), ethers.utils.formatBytes32String("voter2")];
    let chairpersonDid = ethers.utils.formatBytes32String("chairpersonDid");
    let chairperson = accounts[1];

    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await ballots.deployed();

        // assert
        assert.equal(await instance.owner(), owner);
    });
    
    it("is_registerBallot_reverts_not_join_did", async () => {
        // act
        await truffleAssert.reverts(
            instance.registerBallot(
                chairpersonDid, ballotId, candidates, true, startTime, endTime, voters, 
                {from: chairperson}
            ),
            "faild to transfer ether"
        );
    });

    it("is_registerBallot_and_getBallot_works_well", async () => {
        //arrange
        didInstance = await decentralizedId.deployed();
        await didInstance.registerId(chairperson, chairpersonDid);

        // act
        await instance.registerBallot(
            chairpersonDid, ballotId, candidates, true, startTime, endTime, voters,
            {from: chairperson}
        );
        await instance.getBallot(ballotId);
    });

    it("is_registerBallot_reverts_duplicate_ballot", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.registerBallot(
                chairpersonDid, ballotId, candidates, true, startTime, endTime, voters, 
                {from: chairperson}
            ),
            "Already registered ballot (id)."
        );
    });

    it("is_getBallot_reverts_invalid_ballotId", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.getBallot("invalid ballot id"),
            "Unregistered ballot (id)."
        );
    });
});
