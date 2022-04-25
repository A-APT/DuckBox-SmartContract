const truffleAssert = require('truffle-assertions');
const ballots = artifacts.require("Ballots");
const decentralizedId = artifacts.require("DecentralizedId");
const ethers = require('ethers');

contract("Ballots", function (accounts) {
    let owner = accounts[0];
    let instance = null;
    let didInstance = null;

    let ballotId = "ballot id";
    let startTime = Math.floor(Date.now() / 1000);
    let endTime = startTime + 100;
    let candidates = ["candidate1", "candidate2"];
    let voters = [ethers.utils.formatBytes32String("voter1"), ethers.utils.formatBytes32String("voter2")];
    let chairpersonDid = ethers.utils.formatBytes32String("chairpersonDid");
    let chairperson = accounts[1];

    let publicKeyX = BigInt("0x4719ded852f84728c0e25e2a7111e880f4ef516155f62e3db82be7b2981b0323")
    let publicKeyY = BigInt("0xe84813d29f2125b707bc94244aec3c3d52a8025b5f7c988c92736daa22a621ac")

    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await ballots.deployed();

        // assert
        assert.equal(await instance.owner(), owner);
    });
    
    it("is_registerBallot_reverts_not_join_did", async () => {
        // act
        await truffleAssert.reverts(
            instance.registerBallot(
                chairpersonDid, publicKeyX, publicKeyY, ballotId, candidates, true, startTime, endTime, voters, 
                {from: chairperson}
            ),
            "faild to transfer ether"
        );
    });

    it("is_registerBallot_and_getBallot_works_well", async () => {
        //arrange
        didInstance = await decentralizedId.deployed();
        await didInstance.registerId(chairperson, chairpersonDid);

        // act
        await instance.registerBallot(
            chairpersonDid, publicKeyX, publicKeyY, ballotId, candidates, true, startTime, endTime, voters,
            {from: chairperson}
        );
        await instance.getBallot(ballotId);
    });

    it("is_registerBallot_reverts_duplicate_ballot", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.registerBallot(
                chairpersonDid, publicKeyX, publicKeyY, ballotId, candidates, true, startTime, endTime, voters, 
                {from: chairperson}
            ),
            "Already registered ballot (id)."
        );
    });

    it("is_getBallot_reverts_invalid_ballotId", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.getBallot("invalid ballot id"),
            "Unregistered ballot (id)."
        );
    });

    it("is_vote_works_well", async () => {
        //arrange
        //didInstance = await decentralizedId.deployed();
        //await didInstance.registerId(chairperson, chairpersonDid);
        let m = web3.utils.fromUtf8("0")
        let serverSig = BigInt("0x11e7b80d6e93e4e05046ceeecf7d455df4a5979ce4d591745cf271db6b32aea3")
        let ownerSig = BigInt("0xc466193572e1b5d2e63f503b69060b277055dbe1cb475819df4c282e9d68000a")
        let Rx = BigInt("0x77ed80d9de7c800fd4a2b78d67b5dcfc18fad6e076356f10b2fb91bb8577320a")
        let Ry = BigInt("0xc1f3dd157fc5e9a7b96461723a20f28f12917ceca4a2c59d59c8d3adf5681cc9")

        instance.vote(ballotId, m, serverSig, ownerSig, [Rx, Ry]);
    });

    it("is_vote_reverts_invalid_ballotId", async () => {
        // act & assert
        await truffleAssert.reverts(
            instance.vote("invalid ballot id", "0x00", "0x01", "0x02", ["0x03", "0x04"]),
            "Unregistered ballot (id)."
        );
    });
});
