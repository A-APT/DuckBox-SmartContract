const truffleAssert = require('truffle-assertions')
const duckbox = artifacts.require("DuckBox")


contract("DuckBox-did", function (accounts) {
    let owner = accounts[0];
    let instance = null;
    let userAddress = accounts[3];
    let testdid = "test.did";

    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await duckbox.new({from: owner});

        // assert
        assert.equal(await instance.owner(), owner);
        assert.notEqual(await instance.did(), 0);
    });
    it("is_registerDid_works_well", async function () {
        // act & assert
        await instance.registerDid(userAddress, testdid);
        await truffleAssert.reverts(
            instance.registerDid(userAddress, testdid),
            "Already registered address."
        );
    });
    it("is_removeDid_works_well", async function () {
        await instance.removeDid(userAddress);
    });
    it("is_did_reverts_well_since_onlyOwner", async function () {
        let notOwner = accounts[1];
        let userAddress2 = accounts[4];
        let testdid2 = "test.did2";

        // act & assert
        await truffleAssert.reverts(
            instance.registerDid(userAddress2, testdid2, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
        await truffleAssert.reverts(
            instance.removeDid(userAddress2, {from: notOwner}),
            "This function is restricted to the contract's owner."
        );
    });
});


contract("DuckBox-ballot", function (accounts) {
    let owner = accounts[0];
    let instance = null;
    let ballotId = "ballot id";
    let startTime = Math.floor(Date.now() / 1000) + 10;
    let endTime = startTime + 20;
    let candidates = ["candidate1", "candidate2"];
    let voters = ["voter1", "voter2"];
    let chairperson = accounts[1];

    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await duckbox.new({from: owner});

        // assert
        assert.equal(await instance.owner(), owner);
        assert.notEqual(await instance.did(), 0);
    });
    it("is_registerBallot_reverts_unregistered_address", async () => {
        // arrange
        // act
        await truffleAssert.reverts(
            instance.registerBallot(
                ballotId, candidates, true, startTime, endTime, voters,
                {from: chairperson}
            )
        );
    });
    it("is_registerBallot_works_well", async () => {
        // arrange
        await instance.registerDid(chairperson, "test");

        // act
        let ballot = await instance.registerBallot(
            ballotId, candidates, true, startTime, endTime, voters,
            {from: chairperson}
        );
        assert.equal(await instance.owner(), owner);
    });
    it("is_registerBallot_reverts_duplicate_ballot", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.registerBallot( // register with same ballot id
                ballotId, candidates, true, startTime, endTime, voters
            )
        );
    });
    it("is_open_works_well", async () => {
        // wait 3000ms
        await new Promise(resolve => setTimeout(resolve, 10000))

        // act
        await instance.openBallot(ballotId)
    });
    it("is_close_and_getResultOfBallot_works_well", async () => {
        // wait 15000ms
        await new Promise(resolve => setTimeout(resolve, 15000))

        // act
        await instance.closeBallot(ballotId);
        let result = await instance.getResultOfBallot(ballotId);

        // aseert
        assert.equal(result.length, 2, "number of candidate is wrong.")
    });
});

contract("DuckBox-group", function (accounts) {
    let instance = null;
    let groupID = "group id";
    
    let owner = accounts[0];
    let groupApprover = [accounts[1], accounts[2]];
    let user = [accounts[3], accounts[4]];

    let ownerDid = "ownerDid";
    let groupApproverDid = ["groupApprover1", "groupApprover2"];
    let userDid = ["userDid1", "userDid2"];

    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await duckbox.new({from: owner});

        // assert
        assert.equal(await instance.owner(), owner);
        assert.notEqual(await instance.did(), 0)
    });

    it("is_registerGroup_reverts_checkDid", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.registerGroup( // owner do not register did
            groupID, ownerDid, {from: owner}
            ), "Dose not match Did"
        );
    });

    it("is_registerGroup_works_well", async () => {
        // arrange
        await instance.registerDid(owner, ownerDid, {from: owner});

        // act
        await instance.registerGroup(groupID, ownerDid, {from: owner});
        
        // assert
        let ownerStatus = await instance.getMemberStatus(groupID, ownerDid);
        assert.equal(ownerStatus, 3);
    });

    it("is_approveGroupAuthentication_reverts_checkDid_by_approver0", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.approveGroupAuthentication(
                groupID, groupApproverDid[0], {from: groupApprover[0]}
            ), "Dose not match Did"
        );
    });

    it("is_approveGroupAuthentication_work_well_by_approver0", async () => {
        //arrange
        await instance.registerDid(groupApprover[0], groupApproverDid[0], {from: owner});
        
        await instance.approveGroupAuthentication(groupID, groupApproverDid[0], {from: groupApprover[0]});

        // assert
        let approverStatus = await instance.getMemberStatus(groupID, groupApproverDid[0]);
        assert.equal(approverStatus, 3);
    });

    it("is_approveGroupAuthentication_reverts_checkDid_by_approver1", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.approveGroupAuthentication(
                groupID, groupApproverDid[1], {from: groupApprover[1]}
            ), "Dose not match Did"
        );
    });

    it("is_approveGroupAuthentication_work_well_by_approver1", async () => {
        //arrange
        await instance.registerDid(groupApprover[1], groupApproverDid[1], {from: owner});
        
        //act
        await instance.approveGroupAuthentication(groupID, groupApproverDid[1], {from: groupApprover[1]});

        // assert
        let approverStatus = await instance.getMemberStatus(groupID, groupApproverDid[1]);
        assert.equal(approverStatus, 3);
    })

    it("is_requestGroupMember_reverts_checkDid", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.requestGroupMember(
                groupID, userDid[0], {from: user[0]}
            ), "Dose not match Did"
        );
    });

    it("is_requestGroupMember_work_well", async () => {
        //arrange
        await instance.registerDid(user[0], userDid[0], {from: owner});

        // act
        await instance.requestGroupMember(groupID, userDid[0], {from: user[0]});

        //assert
        let requestStatus = await instance.getMemberStatus(groupID, userDid[0]);
        assert.equal(requestStatus, 1);
    });

    it("is_approved_to_join_the_group_by_1_person", async() => {
        //act
        await instance.approveGroupMember(groupID, groupApproverDid[0], userDid[0], {from: groupApprover[0]});

        //assert
        let requestStatus = await instance.getMemberStatus(groupID, userDid[0]);
        assert.equal(requestStatus, 2);
    });

    it("is_approved_to_join_the_group_if_the_approver_does_not_have_the_authority", async() => {
        //act & assert
        await truffleAssert.reverts(
            instance.approveGroupMember(
                groupID, userDid[0], userDid[0], {from: user[0]}
            )
        );
    });

    it("is_approved_to_join_the_group_by_2_person", async() => {
        //act
        await instance.approveGroupMember(groupID, groupApproverDid[1], userDid[0], {from: groupApprover[1]});

        //assert
        let requestStatus = await instance.getMemberStatus(groupID, userDid[0]);
        assert.equal(requestStatus, 3);
    });

    it("is_approved_to_join_the_group_if_already_approved", async() => {
        //act & assert
        await truffleAssert.reverts(
            instance.approveGroupMember(
                groupID, groupApproverDid[1], userDid[0], {from: groupApprover[1]}
            )
        );
    });

    it("is_withdrawal_if_the__requester_does_not_member", async() => {
        //arrange
        await instance.registerDid(user[1], userDid[1], {from: owner});

        //act & assert
        await truffleAssert.reverts(
            instance.exitMember(groupID, userDid[1], {from: user[1]}
            )
        );
    });

    it("is_withdrawal", async() => {
        //act
        await instance.exitMember(groupID, userDid[0], {from: user[0]});
        
        //assert
        let requestStatus = await instance.getMemberStatus(groupID, userDid[0]);
        assert.equal(requestStatus, 0);
    });
});
