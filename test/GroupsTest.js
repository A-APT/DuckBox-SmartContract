const truffleAssert = require('truffle-assertions');
const groups = artifacts.require("Groups");
const ethers = require('ethers');

contract("Groups", function (accounts) {
    let owner = accounts[0];
    let instance = null;

    let groupID = "groupId";
    let groupOwnerID = ethers.utils.formatBytes32String("groupOwnerId");

    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await groups.new({from: owner});

        // assert
        assert.equal(await instance.owner(), owner);
    });
    
    it("is_registerGroup_works_well", async () => {
        // act
        await instance.registerGroup(groupID, groupOwnerID);
    });

    it("is_registerGroup_reverts_duplicate_group", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.registerGroup(groupID, groupOwnerID),
            "Already registered group"
        );
    });

    it("is_deleteGroup_reverts_not_owner", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.deleteGroup(groupID, ethers.utils.formatBytes32String("notGroupOwnerId")),
            "does not match owner did"
        );
    });

    it("is_deleteGroup_works_well", async () => {
        // act
        await instance.deleteGroup(groupID, groupOwnerID);
    });
});
