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
        let userAddress = accounts[3];

        // act, assert
        await instance.registerId(userAddress, did);
        let id = await instance.ids(userAddress);
        assert.equal(id.isValid, true)

        // check re-register revert
        await truffleAssert.reverts(
            instance.registerId(userAddress, did),
            "Already registered address."
        );
    })
    it("is_registerId_reverts_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();
        let userAddress = accounts[4];
        let didtmp = "did.testing.id"
        let notOwner = accounts[1];

        // act, assert: check revert when not owner
        await truffleAssert.reverts(
            instance.registerId(userAddress, didtmp, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
        let id = await instance.ids(userAddress);
        assert.equal(id.isValid, false)
    })
    it("is_removeId_works_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();
        let userAddress = accounts[3];

        // act
        await instance.removeId(userAddress);

        // assert
        let id = await instance.ids(userAddress);
        assert.equal(id.isValid, false)
    })
    it("is_removeId_reverts_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();
        let userAddress = accounts[4];
        let didtmp = "did.testing.tmp"
        let notOwner = accounts[1];
        await instance.registerId(userAddress, didtmp);

        // act, assert: check revert when not owner
        await truffleAssert.reverts(
            instance.removeId(userAddress, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
        let id = await instance.ids(userAddress);
        assert.equal(id.isValid, true)
    })
})
