const truffleAssert = require('truffle-assertions');
const groups = artifacts.require("Groups");
const decentralizedId = artifacts.require("DecentralizedId");
const ethers = require('ethers');

contract("Groups", function (accounts) {
    let instance = null;
    let didInstance = null;

    const groupID = "groupId";
    const ownerDid = ethers.utils.formatBytes32String("0x11");
    const approverDid = [ethers.utils.formatBytes32String("0x12"), ethers.utils.formatBytes32String("0x13")];
    const userDid = [ethers.utils.formatBytes32String("0x14"), ethers.utils.formatBytes32String("0x15")];
    
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
        console.log(await instance.didAddress());

        // assert
        assert.equal(await instance.owner(), groupOwner);
    });

    it("is_registerGroup_revert_before_join_did", async () => {
        await truffleAssert.reverts(
            instance.registerGroup(groupID, ownerDid, {from: groupOwner}),
            "faild to transfer ether"
        );
    });
    
    it("is_registerGroup_works_well", async () => {
        //arrange
        await didInstance.registerId(groupOwner, ownerDid);

        // act
        await instance.registerGroup(groupID, ownerDid, {from: groupOwner});
    });

    it("is_registerGroup_reverts_duplicate_group", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.registerGroup(groupID, ownerDid, {from: groupOwner}),
            "Already registered group"
        );
    });

    it("approveGroupAuthentication1_reverts_before_join_did", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.approveGroupAuthentication(groupID, approverDid[0], {from: approver[0]}),
            "faild to transfer ether"
        );
    });

    it("approveGroupAuthentication1", async () => {
        //arrange
        await didInstance.registerId(approver[0], approverDid[0]);

        //act
        let tx = await instance.approveGroupAuthentication(groupID, approverDid[0], {from: approver[0]});

        //assert
        let status = await instance.getMemberStatus(groupID, approverDid[0]);
        assert.equal(status, true);

        // check event not emitted
        truffleAssert.eventNotEmitted(tx, 'groupAuthCompleted');
    });

    it("requestMember_reverts_befor_join_did", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.requestMember(groupID, userDid[0], "name", "email", {from: user[0]}),
            "faild to transfer ether"
        );
    });

    it("requestMember_reverts_befor_group_approve", async () => {
        //arrange
        await didInstance.registerId(user[0], userDid[0]);

        // act & assert
        await truffleAssert.reverts(
            instance.requestMember(groupID, userDid[0], "name", "email", {from: user[0]}),
            "restricted to the Valid group"
        );
    });

    it("approveGroupAuthentication2", async () => {
        //arrange
        await didInstance.registerId(approver[1], approverDid[1]);

        //act
        let tx = await instance.approveGroupAuthentication(groupID, approverDid[1], {from: approver[1]});
    
        //assert
        let status = await instance.getMemberStatus(groupID, approverDid[1]);
        assert.equal(status, true);

        // check event was emitted
        truffleAssert.eventEmitted(tx, 'groupAuthCompleted', (ev) => {
            return ev.groupId === groupID;
        });
    });

    it("requestMember_works_well", async () => {
        //act
        await instance.requestMember(groupID, userDid[0], "name", "email", {from: user[0]});

        //assert
        let list = await instance.getRequesterList(groupID);
        assert.equal(list[0][0], userDid[0]);
        assert.equal(list[0][1], false);
    });

    it("approveMember_reverts_not_authority", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.approveMember(groupID, userDid[1], userDid[0], {from: user[1]}),
            "faild to transfer ether"
        );
    });

    it("approveMember_work_well", async () => {
        // act & assert
        let tx = await instance.approveMember(groupID, approverDid[0], userDid[0], {from: approver[0]})
    
        //assert
        let list = await instance.getRequesterList(groupID);
        assert.equal(list[0][0], userDid[0]);
        assert.equal(list[0][1], true);

        // check event not emitted
        truffleAssert.eventNotEmitted(tx, 'memberAuthCompleted');
    });

    it("approveMember_work_well2", async () => {
        // act & assert
        let tx = await instance.approveMember(groupID, approverDid[1], userDid[0], {from: approver[1]})
    
        //assert
        let list = await instance.getRequesterList(groupID);
        console.log(list);

        let status = await instance.getMemberStatus(groupID, userDid[0]);
        assert.equal(status, true);

        // check event was emitted
        truffleAssert.eventEmitted(tx, 'memberAuthCompleted', (ev) => {
            return ev.groupId === groupID && ev.did === userDid[0];
        });
    });


    it("exitMember_reverts_not_member", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.exitMember(groupID, userDid[1], {from: user[1]}),
            "faild to transfer ether"
        );
    });

    it("exitMember_work_well", async () => {
        // act
        await instance.exitMember(groupID, userDid[0], {from: user[0]});

        //assert
        let status = await instance.getMemberStatus(groupID, userDid[0]);
        assert.equal(status, false);
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
        await instance.deleteGroup(groupID, ownerDid);
    });
});
