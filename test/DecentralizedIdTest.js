var decentralizedId = artifacts.require("DecentralizedId")

contract("DecentralizedId", function (accounts) {
    it("is_owner_works_well", async function () {
        let instance = await decentralizedId.deployed();
        let owner = await instance.owner();

        assert.equal(
            owner.valueOf(),
            accounts[0],
            "accounts[0] wasn't the contract owner."
        )
    })
})
