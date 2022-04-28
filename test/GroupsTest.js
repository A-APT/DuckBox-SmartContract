const truffleAssert = require('truffle-assertions');
const groups = artifacts.require("Groups");
const decentralizedId = artifacts.require("DecentralizedId");
const ethers = require('ethers');

contract("Groups", function (accounts) {
    let owner = accounts[0];
    let instance = null;
    let didInstance = null;

    const groupID = "groupId";
    const ownerDid = ethers.utils.formatBytes32String("owner");
    const approverDid = [ethers.utils.formatBytes32String("approver1"), ethers.utils.formatBytes32String("approver2")];
    const userDid = [ethers.utils.formatBytes32String("user1"), ethers.utils.formatBytes32String("user2")];
    
    const groupOwner = accounts[0];
    const approver = [accounts[1], accounts[2]];
    const user = [accounts[3], accounts[4]];

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

    it("is_registerGroup_revert_before_join_did", async () => {
        await truffleAssert.reverts(
            instance.registerGroup(groupID, groupOwnerDID, {from: groupOwnerAddr}),
            "faild to transfer ether"
        );
    });
    
    it("is_registerGroup_works_well", async () => {
        //arrange
        await didInstance.registerId(groupOwnerAddr, groupOwnerDID);

        // act
        await instance.registerGroup(groupID, groupOwnerDID, {from: groupOwnerAddr});
    });

    it("is_registerGroup_reverts_duplicate_group", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.registerGroup(groupID, groupOwnerDID, {from: groupOwnerAddr}),
            "Already registered group"
        );
    });

    // it("approveGroupAuthentication", async () => {
    //     //arrange
    //     await didInstance.registerId(approver[0], approverDid[0]);

    //     //act
    //     await instance.approveGroupAuthentication(groupID, approverDid[0], {from: approver[0]});
    // });

    // it("requestMember", async () => {
        
    // });

    // it("approveGroupAuthentication2", async () => {
    //     //arrange
    //     await didInstance.registerId(approver[1], approverDid[1]);

    //     //act
    //     await instance.approveGroupAuthentication(groupID, approverDid[1], {from: approver[1]});
    // });

    // it("is_deleteGroup_reverts_not_owner", async () => {
    //     // act & assert
    //     await truffleAssert.reverts(
    //         instance.deleteGroup(groupID, ethers.utils.formatBytes32String("notGroupOwnerDId")),
    //         "does not match owner did."
    //     );
    // });

    // it("is_deleteGroup_works_well", async () => {
    //     // act
    //     await instance.deleteGroup(groupID, groupOwnerDID);
    // });

    
});
