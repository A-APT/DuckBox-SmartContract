const truffleAssert = require('truffle-assertions');
const group = artifacts.require("Group");
const ethers = require('ethers');

contract("Group", function (accounts) {
    let instance = null;
    const groupID = "groupId";
    const ownerDid = ethers.utils.formatBytes32String("owner");
    const approverDid = [ethers.utils.formatBytes32String("approver1"), ethers.utils.formatBytes32String("approver2")];
    const userDid = [ethers.utils.formatBytes32String("user1"), ethers.utils.formatBytes32String("user2")];

    it("Confirm_group_creation", async function () {
        //arrange
        instance = await group.deployed();
        
        //act
        let owner = await instance.owner();

        //check
        assert.equal(await instance.groupId().valueOf(), groupID, "Does not match groupId");
        assert.equal(owner.valueOf(), ownerDid, "Does not match owner");

        let ownerStatus = await instance.members(ownerDid);
        assert.equal(ownerStatus, 3, "Group owner's valid is False");

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

    it("Request_exitMember_before_completing_group_authentication", async () => {
        await truffleAssert.reverts(
            instance.exitMember(approverDid[0]),
            "This function is restricted to the Valid group"
        );
    });

    it("Group_authentication_by_1_person", async () => {
        // act
        let tx = await instance.approveGroupAuthentication(approverDid[0]);

        // assert
        let status = await instance.status();
        assert.equal(status, 1, "not equal status");

        let groupApprover1Status = await instance.members(approverDid[0]);
        assert.equal(groupApprover1Status, 3, "not equal status");

        // check event: not emitted when group status changed to WAITING
        truffleAssert.eventNotEmitted(tx, 'groupAuthCompleted');
    });

    it("Group_authentication_when_the_same_person_approves", async () => {
        await truffleAssert.reverts(
            instance.approveGroupAuthentication(approverDid[0]),
            "can not approve"
        );
    });

    it("Group_authentication_by_2_person", async () => {
        // act
        let tx = await instance.approveGroupAuthentication(approverDid[1]);

        // arrange
        let status = await instance.status();
        assert.equal(status, 2, "not equal status");

        let groupApprover2Status = await instance.members(approverDid[1]);
        assert.equal(groupApprover2Status, 3, "not equal status");

        // check event: emit event when group status changed to VALID
        truffleAssert.eventEmitted(tx, 'groupAuthCompleted', (ev) => {
            return ev.groupId === groupID;
        });
    });

    it("Request_to_join_a_group", async () => {
        await instance.requestMember(userDid[0]);

        let status = await instance.members(userDid[0]);
        assert.equal(status, 1, "not equal status");
    });

    it("Approved_to_join_the_group_by_1_person", async() => {
        await instance.approveMember(approverDid[0], userDid[0]);

        let status = await instance.members(userDid[0]);
        assert.equal(status, 2, "not equal status");
    });

    it("Approved_to_join_the_group_if_the_approver_does_not_have_the_authority", async() => {
        await truffleAssert.reverts(
            instance.approveMember(userDid[0], userDid[0]),
            "No permission"
        );
    });

    it("Approved_to_join_the_group_by_2_person", async() => {
        await instance.approveMember(approverDid[1], userDid[0]);

        let status = await instance.members(userDid[0]);
        assert.equal(status, 3, "not equal status");
    });

    it("Approved_to_join_the_group_if_already_approved", async() => {
        await truffleAssert.reverts(
            instance.approveMember(approverDid[1], userDid[0]),
            "Already group member"
        );
    });

    it("Withdrawal_if_the__requester_does_not_member", async() => {
        await truffleAssert.reverts(
            instance.exitMember(userDid[1]),
            "Not member"
        );
    });

    it("Withdrawal", async() => {
        await instance.exitMember(userDid[0]);

        let status = await instance.members(userDid[0]);
        assert.equal(status, 0, "not equal status");
    });
});
