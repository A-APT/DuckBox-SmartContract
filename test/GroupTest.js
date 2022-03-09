const truffleAssert = require('truffle-assertions')
const group = artifacts.require("Group")

contract("Group", function (accounts) {
    const _groupOwnerDid = "groupOwnerDid";
    const _groupApprover1 = "groupApprover1";
    const _groupApprover2 = "groupApprover2";
    const _userDid1 = "userDid1";
    const _userDid2 = "userDid2";

    it("Confirm_group_creation", async function () {
        //arrange
        let instance = await group.deployed();
        
        //act
        let owner = await instance.owner();

        //check
        assert.equal(owner.valueOf(),accounts[0],"Does not match owner");

        let ownderStatus = await instance.members(_groupOwnerDid);
        assert.equal(ownderStatus, 3, "Group owner's valid is False");

        let status = await instance.status();
        assert.equal(status, 0, "not equal status");

    });

    it("Request_to_join_before_completing_group_authentication", async () => {
        let instance = await group.deployed();

        await truffleAssert.reverts(
            instance.requestMember(_userDid1),
            "This function is restricted to the Valid group"
        );
    });

    it("Request_approval_before_completing_group_authentication", async () => {
        let instance = await group.deployed();

        await truffleAssert.reverts(
            instance.approveMember(_userDid1, _groupOwnerDid),
            "This function is restricted to the Valid group"
        );
    });

    it("Request_exitMember_before_completing_group_authentication", async () => {
        let instance = await group.deployed();

        await truffleAssert.reverts(
            instance.exitMember(_groupApprover1),
            "This function is restricted to the Valid group"
        );
    });

    it("Group_authentication_by_1_person", async () => {
        let instance = await group.deployed();

        await instance.approveGroupAuthentication(_groupApprover1);

        let status = await instance.status();
        assert.equal(status, 1, "not equal status");

        let groupApprover1Status = await instance.members(_groupApprover1);
        assert.equal(groupApprover1Status, 3, "not equal status");
    });

    it("Group_authentication_when_the_same_person_approves", async () => {
        let instance = await group.deployed();

        await truffleAssert.reverts(
            instance.approveGroupAuthentication(_groupApprover1),
            "can not approve"
        );
    });

    it("Group_authentication_by_2_person", async () => {
        let instance = await group.deployed();

        await instance.approveGroupAuthentication(_groupApprover2);

        let status = await instance.status();
        assert.equal(status, 2, "not equal status");

        let groupApprover2Status = await instance.members(_groupApprover2);
        assert.equal(groupApprover2Status, 3, "not equal status");
    });

    it("Request_to_join_a_group", async () => {
        let instance = await group.deployed();

        await instance.requestMember(_userDid1);

        let status = await instance.members(_userDid1);
        assert.equal(status, 1, "not equal status");
    });

    it("Approved_to_join_the_group_by_1_person", async() => {
        let instance = await group.deployed();

        await instance.approveMember(_groupApprover1, _userDid1);

        let status = await instance.members(_userDid1);
        assert.equal(status, 2, "not equal status");
    });

    it("Approved_to_join_the_group_if_the_approver_does_not_have_the_authority", async() => {
        let instance = await group.deployed();

        await truffleAssert.reverts(
            instance.approveMember(_userDid1, _userDid1),
            "No permission"
        );
    });

    it("Approved_to_join_the_group_by_2_person", async() => {
        let instance = await group.deployed();

        await instance.approveMember(_groupApprover2, _userDid1);

        let status = await instance.members(_userDid1);
        assert.equal(status, 3, "not equal status");
    });

    it("Approved_to_join_the_group_if_already_approved", async() => {
        let instance = await group.deployed();

        await truffleAssert.reverts(
            instance.approveMember(_groupApprover2, _userDid1),
            "Already group member"
        );
    });

    it("Withdrawal_if_the__requester_does_not_member", async() => {
        let instance = await group.deployed();

        await truffleAssert.reverts(
            instance.exitMember(_userDid2),
            "Not member"
        );
    });

    it("Withdrawal", async() => {
        let instance = await group.deployed();

        await instance.exitMember(_userDid1);

        let status = await instance.members(_userDid1);
        assert.equal(status, 0, "not equal status");
    });
});
