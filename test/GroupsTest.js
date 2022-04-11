const truffleAssert = require('truffle-assertions');
const groups = artifacts.require("Groups");
const decentralizedId = artifacts.require("DecentralizedId");
const ethers = require('ethers');

contract("Groups", function (accounts) {
    let owner = accounts[0];
    let instance = null;
    let didInstance = null;

    let groupID = "groupId";
    let groupOwnerAddr = accounts[1];
    let groupOwnerDID = ethers.utils.formatBytes32String("groupOwnerDId");

    let addr; //did contract address

    it("is_constructor_works_well", async function () {
        // arrange
        instance = await groups.deployed();
        didInstance = await decentralizedId.deployed();

        addr = await didInstance.getContractAddress();
        console.log(addr);

        // assert
        assert.equal(await instance.owner(), owner);
    });
    
    it("is_registerGroup_works_well", async () => {
        //arrange
        await didInstance.registerId(groupOwnerAddr, groupOwnerDID);

        // act
        await instance.registerGroup(groupID, groupOwnerDID, {from: groupOwnerAddr});

        let group = await instance.getGroups(groupID);
        console.log(group);
    });

    it("is_registerGroup_reverts_duplicate_group", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.registerGroup(groupID, groupOwnerDID, {from: groupOwnerAddr}),
            "Already registered group"
        );
    });

    it("is_deleteGroup_reverts_not_owner", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.deleteGroup(groupID, ethers.utils.formatBytes32String("notGroupOwnerDId")),
            "does not match owner did."
        );
    });

    it("is_deleteGroup_works_well", async () => {
        // act
        await instance.deleteGroup(groupID, groupOwnerDID);

        let group = await instance.getGroups(groupID);
        console.log(group);
    });
});
