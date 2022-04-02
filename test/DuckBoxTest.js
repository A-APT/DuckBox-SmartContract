const truffleAssert = require('truffle-assertions')
const duckbox = artifacts.require("DuckBox")


contract("DuckBox-did", function (accounts) {
    let owner = accounts[0]
    let instance = null
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
        await instance.registerDid(testdid)
        await truffleAssert.reverts(
            instance.registerDid(testdid),
            "Already registered ID."
        );
    })
    it("is_removeDid_works_well", async function () {
        await instance.removeDid(testdid);
    })
    it("is_did_reverts_well_since_onlyOwner", async function () {
        let notOwner = accounts[1];
        let testdid2 = "test.did2"

        // act & assert
        await truffleAssert.reverts(
            instance.registerDid(testdid2, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
        await truffleAssert.reverts(
            instance.removeDid(testdid2, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
    })
})