const truffleAssert = require('truffle-assertions');
const group = artifacts.require("Group");
const decentralizedId = artifacts.require("DecentralizedId");
const ethers = require('ethers');

contract("Group", function (accounts) {
    let instance = null;

    const groupID = "groupId";
    const ownerDid = ethers.utils.formatBytes32String("owner");
    const approverDid = [ethers.utils.formatBytes32String("approver1"), ethers.utils.formatBytes32String("approver2")];
    const userDid = [ethers.utils.formatBytes32String("user1"), ethers.utils.formatBytes32String("user2")];
    
    const groupOwner = accounts[0];
    const approver = [accounts[1], accounts[2]];
    const user = [accounts[3], accounts[4]];

    it("Confirm_group_creation", async function () {
        //act
        instance = await group.new(groupID, ownerDid);
        
        //check
        assert.equal(await instance.groupId().valueOf(), groupID, "Does not match groupId");

        let ownerStatus = await instance.members(ownerDid);
        assert.equal(ownerStatus, true, "Group owner's valid is False");

        let status = await instance.status();
        assert.equal(status, 0, "not equal status");
    });

    it("Request_to_join_before_completing_group_authentication", async () => {
        await truffleAssert.reverts(
            instance.requestMember(userDid[0]),
            "This function is restricted to the Valid group"
        );
    });

    it("Request_approval_before_completing_group_authentication", async () => {
        await truffleAssert.reverts(
            instance.approveMember(userDid[0], ownerDid),
            "This function is restricted to the Valid group"
        );
    });

    it("Group_authentication_by_1_person", async () => {
        // act
        let tx = await instance.approveGroupAuthentication(
            approverDid[0], {from: approver[0]});

        // assert
        let status = await instance.status();
        assert.equal(status, 1, "not equal status");

        let groupApprover1Status = await instance.members(approverDid[0]);
        assert.equal(groupApprover1Status, true, "not equal status");

        // check event: not emitted when group status changed to WAITING
        truffleAssert.eventNotEmitted(tx, 'groupAuthCompleted');
    });

    it("Group_authentication_when_the_same_person_approves", async () => {
        await truffleAssert.reverts(
            instance.approveGroupAuthentication(approverDid[0], {from: approver[0]}),
            "can not approve"
        );
    });

    it("Group_authentication_by_2_person", async () => {
        // act
        let tx = await instance.approveGroupAuthentication(
            approverDid[1], {from: approver[1]});

        // assert
        let status = await instance.status();
        assert.equal(status, 2, "not equal status");

        let groupApprover2Status = await instance.members(approverDid[1]);
        assert.equal(groupApprover2Status, true, "not equal status");

        // check event: emit event when group status changed to VALID
        truffleAssert.eventEmitted(tx, 'groupAuthCompleted', (ev) => {
            return ev.groupId === groupID;
        });
    });

    it("Request_to_join_a_group", async () => {
        //act
        await instance.requestMember(userDid[0], {from: user[0]});

        //check
        let status = await instance.getRequesterVaild(0);
        assert.equal(status, false, "not equal status");
    });

    it("Approved_to_join_the_group_by_1_person", async() => {
        //act
        await instance.approveMember(approverDid[0], userDid[0], {from: approver[0]});
    
        //check
        let status = await instance.getRequesterVaild(0);
        assert.equal(status, true, "not equal status");
    });

    it("Approved_to_join_the_group_if_the_approver_does_not_have_the_authority", async() => {
        await truffleAssert.reverts(
            instance.approveMember(userDid[0], userDid[0], {from: user[0]}),
            "No permission"
        );
    });

    it("Approved_to_join_the_group_by_2_person", async() => {
        //act
        await instance.approveMember(approverDid[1], userDid[0], {from: approver[1]});

        //check
        let status = await instance.members(userDid[0]);
        assert.equal(status, true, "not equal status");
    });

    it("Approved_to_join_the_group_if_already_approved", async() => {
        await truffleAssert.reverts(
            instance.approveMember(approverDid[1], userDid[0], {from: approver[1]}),
            "Already group member"
        );
    });

    it("Withdrawal_if_the__requester_does_not_member", async() => {
        //act
        await truffleAssert.reverts(
            instance.exitMember(userDid[1], {from: user[1]}),
            "Not member"
        );
    });

    it("Withdrawal", async() => {
        //act
        await instance.exitMember(userDid[0], {from: user[0]});

        //check
        let status = await instance.members(userDid[0]);
        assert.equal(status, false, "not equal status");
    });
});
