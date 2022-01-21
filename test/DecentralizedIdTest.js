var decentralizedId = artifacts.require("DecentralizedId")
const truffleAssert = require('truffle-assertions')

contract("DecentralizedId", function (accounts) {
    const userdid = "did.testing";
    it("is_owner_works_well", async function () {
        let instance = await decentralizedId.deployed();
        let owner = await instance.owner();

        assert.equal(
            owner.valueOf(),
            accounts[0],
            "accounts[0] wasn't the contract owner."
        )
    })
    it("is_registerUser_works_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();

        // act, assert
        await instance.registerUser(userdid);
        let user = await instance.users(userdid);
        assert.equal(user.isValid, true)

        // check re-register revert
        await truffleAssert.reverts(
            instance.registerUser(userdid),
            "Already registered user."
        );
    })
    it("is_registerUser_reverts_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();
        const userdid = "did.testing2";
        let notOwner = accounts[1];

        // act, assert: check revert when not owner
        await truffleAssert.reverts(
            instance.registerUser(userdid, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
    })
    it("is_getUser_works_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();
        let notOwner = accounts[1];

        // act
        const user = await instance.getUser(userdid, {from: notOwner});

        // assert
        assert.equal(user.id, userdid);
        assert.equal(user.isValid, true);
    })
    it("is_removeUser_works_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();

        // act
        await instance.removeUser(userdid);

        // assert
        let user = await instance.users(userdid);
        assert.equal(user.isValid, false)
    })
    it("is_removeUser_reverts_well", async () => {
        // arrange
        let instance = await decentralizedId.deployed();
        let userdidtmp = "did.testing.tmp"
        let notOwner = accounts[1];
        await instance.registerUser(userdidtmp);

        // act, assert: check revert when not owner
        await truffleAssert.reverts(
            instance.removeUser(userdidtmp, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
        let user = await instance.users(userdidtmp);
        assert.equal(user.isValid, true)
    })
})
