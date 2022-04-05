const truffleAssert = require('truffle-assertions')
const duckbox = artifacts.require("DuckBox")


contract("DuckBox-did", function (accounts) {
    let owner = accounts[0]
    let instance = null
    let userAddress = accounts[3]
    let testdid = "test.did"

    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await duckbox.new({from: owner});

        // assert
        assert.equal(await instance.owner(), owner);
        assert.notEqual(await instance.did(), 0)
    })
    it("is_registerDid_works_well", async function () {
        // act & assert
        await instance.registerDid(userAddress, testdid)
        await truffleAssert.reverts(
            instance.registerDid(userAddress, testdid),
            "Already registered address."
        );
    })
    it("is_removeDid_works_well", async function () {
        await instance.removeDid(userAddress);
    })
    it("is_did_reverts_well_since_onlyOwner", async function () {
        let notOwner = accounts[1];
        let userAddress2 = accounts[4];
        let testdid2 = "test.did2"

        // act & assert
        await truffleAssert.reverts(
            instance.registerDid(userAddress2, testdid2, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
        await truffleAssert.reverts(
            instance.removeDid(userAddress2, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
    })
})


contract("DuckBox-ballot", function (accounts) {
    let owner = accounts[0]
    let instance = null
    let ballotId = "ballot id"
    let startTime = Math.floor(Date.now() / 1000) + 10
    let endTime = startTime + 20
    let candidates = ["candidate1", "candidate2"]
    let voters = ["voter1", "voter2"]
    let chairperson = accounts[1]

    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await duckbox.new({from: owner});

        // assert
        assert.equal(await instance.owner(), owner);
        assert.notEqual(await instance.did(), 0)
    })
    it("is_registerBallot_reverts_unregistered_address", async () => {
        // arrange
        // act
        await truffleAssert.reverts(
            instance.registerBallot(
                ballotId, candidates, true, startTime, endTime, voters,
                {from: chairperson}
            )
        )
    })
    it("is_registerBallot_works_well", async () => {
        // arrange
        await instance.registerDid(chairperson, "test");

        // act
        let ballot = await instance.registerBallot(
            ballotId, candidates, true, startTime, endTime, voters,
            {from: chairperson}
        )
        assert.equal(await instance.owner(), owner);
    })
    it("is_registerBallot_reverts_duplicate_ballot", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.registerBallot( // register with same ballot id
                ballotId, candidates, true, startTime, endTime, voters
            )
        );
    })
    it("is_open_works_well", async () => {
        // wait 3000ms
        await new Promise(resolve => setTimeout(resolve, 10000))

        // act
        await instance.openBallot(ballotId)
    })
    it("is_close_and_getResultOfBallot_works_well", async () => {
        // wait 15000ms
        await new Promise(resolve => setTimeout(resolve, 15000))

        // act
        await instance.closeBallot(ballotId);
        let result = await instance.getResultOfBallot(ballotId);

        // aseert
        assert.equal(result.length, 2, "number of candidate is wrong.")
    })
})
