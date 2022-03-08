const truffleAssert = require('truffle-assertions')
const decentralizedId = artifacts.require("DecentralizedId")

contract("DecentralizedId", function (accounts) {
    const did = "did.testing";
    it("is_owner_works_well", async function () {
        let instance = await decentralizedId.deployed();
        let owner = await instance.owner();

        assert.equal(
            owner.valueOf(),
            accounts[0],
            "accounts[0] wasn't the contract owner."
        )
    })
    it("is_registerId_works_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();
        
        // act, assert
        await instance.registerId(did);
        let id = await instance.ids(did);
        assert.equal(id.isValid, true)

        // check re-register revert
        await truffleAssert.reverts(
            instance.registerId(did),
            "Already registered ID."
        );
    })
    it("is_registerId_reverts_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();
        const did = "did.testing2";
        let notOwner = accounts[1];

        // act, assert: check revert when not owner
        await truffleAssert.reverts(
            instance.registerId(did, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
    })
    it("is_getId_works_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();
        let notOwner = accounts[1];
        let owner = await instance.owner();

        // act
        const id = await instance.getId(did, {from: notOwner});

        // assert
        assert.equal(id.addr, owner);
        assert.equal(id.isValid, true);
    })
    it("is_removeId_works_well", async ()m => {
        // arrange
        let instance = await decentralizedId.deployed();

        // act
        await instance.removeId(did);

        // assert
        let id = await instance.ids(did);
        assert.equal(id.isValid, false)
    })
    it("is_removeId_reverts_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();
        let didtmp = "did.testing.tmp"
        let notOwner = accounts[1];
        await instance.registerId(didtmp);

        // act, assert: check revert when not owner
        await truffleAssert.reverts(
            instance.removeId(didtmp, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
        let id = await instance.ids(didtmp);
        assert.equal(id.isValid, true)
    })
})
