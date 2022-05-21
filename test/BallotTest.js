const truffleAssert = require('truffle-assertions');
const ballot = artifacts.require("Ballot");
const ethers = require('ethers');

const candidates = ["candidate1", "candidate2"];
const REGISTERED = 0;
const OPEN = 1;
const CLOSE = 2;
let publicKeyX = BigInt("0x4719ded852f84728c0e25e2a7111e880f4ef516155f62e3db82be7b2981b0323")
let publicKeyY = BigInt("0xe84813d29f2125b707bc94244aec3c3d52a8025b5f7c988c92736daa22a621ac")

contract("Ballot_official", function (accounts) {
    let instance = null;
    let startTime = Math.floor(Date.now() / 1000) + 2;
    let endTime = startTime + 40;
    it("is_constructor_works_well", async function () {
        // get instance first
        instance = await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime); // official ballot

        // assert
        let chairperson = await instance.chairperson();
        assert.equal(chairperson.valueOf(), accounts[0], "accounts[0] wasn't the contract owner(chairperson).");
        assert.equal(await instance.status(), REGISTERED);
        assert.equal(await instance.isOfficial(), true);
        assert.equal(await instance.startTime(), startTime);
        assert.equal(await instance.endTime(), endTime);
    });

    it("is_candidates_not_works_well", async () => {
        // act, assert: check fail at call candidates (it is private)
        try {
            await instance.candidates(candidates[0]);
            assert.fail("This should be failed...");
        } catch (e) {
            assert.equal(e instanceof TypeError, true);
            assert.equal(e.message, "instance.candidates is not a function");
        }
    });

    it("is_resultOfBallot_reverts_on_not_closed", async () => {
        // act, assert: check revert when not CLOSE status
        await truffleAssert.reverts(
            instance.resultOfBallot(),
            "This function is restricted only at CLOSE status."
        );
    });

    it("is_close_reverts_not_on_OPEN", async () => {
        // act, assert: check revert when not on OPEN status
        await truffleAssert.reverts(
            instance.close(0),
            "This function can be called only at OPEN status."
        );
    });

    it("is_open_works_well", async () => {
        // wait 3000ms
        await new Promise(resolve => setTimeout(resolve, 3000));

        // act
        await instance.open();

        // assert
        assert.equal(await instance.status(), OPEN);
    });

    it("is_open_reverts_not_on_REGISTRED", async () => {
        // arrange
        let tempInstance = await ballot.deployed(candidates, true, Date.now() + 10, Date.now() + 100); // official ballot
        let notOwner = accounts[1];

        // act, assert: check revert when not on REGISTERED status
        await truffleAssert.reverts(
            instance.open(),
            "This function can be called only at REGISTERED status."
        );
    });

    it("is_vote_works_well", async function () {
        let m = web3.utils.fromUtf8("0")
        let serverSig = BigInt("0x11e7b80d6e93e4e05046ceeecf7d455df4a5979ce4d591745cf271db6b32aea3")
        let ownerSig = BigInt("0xc466193572e1b5d2e63f503b69060b277055dbe1cb475819df4c282e9d68000a")
        let Rx = BigInt("0x77ed80d9de7c800fd4a2b78d67b5dcfc18fad6e076356f10b2fb91bb8577320a")
        let Ry = BigInt("0xc1f3dd157fc5e9a7b96461723a20f28f12917ceca4a2c59d59c8d3adf5681cc9")
        await instance.vote(m, serverSig, ownerSig, [Rx, Ry]);
    })

    it("is_close_reverts_totalNum_is_not_the_same", async () => {
        await truffleAssert.reverts(
            instance.close(0),
            "Number of signature and vote count is not the same"
        );
    });

    it("is_close_reverts_before_endTime", async () => {
        // act, assert: check revert when before the end time
        await truffleAssert.reverts(
            instance.close(1),
            "Before the end time."
        );
        assert.equal(await instance.status(), OPEN);
    });

    it("is_close_and_resultOfBallot_works_well", async () => {
        // wait 30000ms
        await new Promise(resolve => setTimeout(resolve, 30000));

        // act
        await instance.close(1);
        let result = await instance.resultOfBallot();

        // aseert
        let status = await instance.status();
        assert.equal(status, CLOSE); // check status is CLOSE

        assert.equal(result.length, 2, "number of candidate is wrong.");
        //assert.equal(result[0].name, candidates[0], "candidate name is wrong.");
        assert.equal(result[0], 1, "voteCount is wrong.");
    });
});

contract("Ballot_status", function (accounts) {
    it("is_constructor_works_well_on_after_startTime", async () => {
        // arrange & act
        let startTime = Math.floor(Date.now() / 1000) - 10;
        let endTime = Math.floor(Date.now() / 1000) + 10;
        let instance = await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime);

        // assert
        let status = await instance.status();
        assert.equal(status, OPEN); // check status is OPEN
    });

    it("is_constructor_reverts_when_endTime_is_earlier_than_startTime", async function () {
        // arrange
        let startTime = Math.floor(Date.now() / 1000) + 500;
        let endTime = startTime - 100;

        // act & assert
        try {
            await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime);
            assert.fail("This should be failed...");
        } catch (e) {
            assert.equal(e.message, "Returned error: base fee exceeds gas limit -- Reason given: The start time must be earlier than the end time..");
        }
    });

    it("is_constructor_reverts_when_endTime_is_earlier_than_now", async function () {
        // arrange
        let endTime = Math.floor(Date.now() / 1000) - 100;
        let startTime = endTime - 100;

        // act & assert
        try {
            await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime);
            assert.fail("This should be failed...");
        } catch (e) {
            assert.equal(e.message, "Returned error: base fee exceeds gas limit -- Reason given: The start time must be earlier than the end time..");
        }
    });

    it("is_open_reverts_before_startTime", async function () {
        // arrange
        let startTime = Math.floor(Date.now() / 1000) + 100;
        let endTime = startTime + 200;
        let instance = await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime);

        // assert
        await truffleAssert.reverts(
            instance.open(),
            "Before the start time."
        );
    });
});

contract("Ballot_community", function (accounts) {
    let instance = null;
    let startTime = Math.floor(Date.now() / 1000);
    let endTime = startTime + 100;

    it("is_constructor_works_well", async function () {
        // arrange
        // get instance first
        instance = await ballot.new(publicKeyX, publicKeyY, candidates, false, startTime, endTime);

        // assert
        let chairperson = await instance.chairperson();
        assert.equal(chairperson.valueOf(), accounts[0], "accounts[0] wasn't the contract owner(chairperson).");
        assert.equal(await instance.status(), OPEN);
        assert.equal(await instance.isOfficial(), false);
        assert.equal(await instance.startTime(), startTime);
        assert.equal(await instance.endTime(), endTime);
    });
});

contract("Ballot:: vote", function (accounts) {
    let instance = null;
    let startTime = Math.floor(Date.now() / 1000) - 10;
    let endTime = startTime + 40000;

    it("is_vote_works_well", async function () {
        // get instance first
        instance = await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime, endTime); // official ballot;
        let m = web3.utils.fromUtf8("0")
        let serverSig = BigInt("0x11e7b80d6e93e4e05046ceeecf7d455df4a5979ce4d591745cf271db6b32aea3")
        let ownerSig = BigInt("0xc466193572e1b5d2e63f503b69060b277055dbe1cb475819df4c282e9d68000a")
        let Rx = BigInt("0x77ed80d9de7c800fd4a2b78d67b5dcfc18fad6e076356f10b2fb91bb8577320a")
        let Ry = BigInt("0xc1f3dd157fc5e9a7b96461723a20f28f12917ceca4a2c59d59c8d3adf5681cc9")
        await instance.vote(m, serverSig, ownerSig, [Rx, Ry]);
    })
    it("is_vote_reverts_when_invalid_sig", async function () {
        let m = web3.utils.fromUtf8("0")
        let Rx = BigInt("0x77ed80d9de7c800fd4a2b78d67b5dcfc18fad6e076356f10b2fb91bb8577320a")
        let Ry = BigInt("0xc1f3dd157fc5e9a7b96461723a20f28f12917ceca4a2c59d59c8d3adf5681cc9")
        try {
            await instance.vote(m, "0x01", "0x02", [Rx, Ry], {gas: 30000000})
            assert.fail("This should be failed...");
        } catch (e) {
            assert.equal(e.message, "Returned error: Exceeds block gas limit -- Reason given: Verify went wrong: x.");
        }
    })

    it("is_vote_reverts_not_on_open", async () => {
        let instance2 = await ballot.new(publicKeyX, publicKeyY, candidates, true, startTime + 20000, endTime); // official ballot;

        // act, assert: check revert when not OPEN status
        await truffleAssert.reverts(
            instance2.vote("0x00", "0x01", "0x02", ["0x03", "0x04"]),
            "Vote is allowed at Ballot is OPEN."
        );
    });

    it("is_vote_reverts_on_duplicated_server_sig", async () => {
        let m = web3.utils.fromUtf8("0")
        let serverSig = BigInt("0x11e7b80d6e93e4e05046ceeecf7d455df4a5979ce4d591745cf271db6b32aea3")

        // act, assert: check revert when not OPEN status
        await truffleAssert.reverts(
            instance.vote(m, serverSig, "0x02", ["0x03", "0x04"]),
            "The server signature has already been used."
        );
    });

    it("is_vote_reverts_on_duplicated_owner_sig", async () => {
        let m = web3.utils.fromUtf8("0")
        let ownerSig = BigInt("0xc466193572e1b5d2e63f503b69060b277055dbe1cb475819df4c282e9d68000a")

        // act, assert: check revert when not OPEN status
        await truffleAssert.reverts(
            instance.vote(m, "0x01", ownerSig, ["0x03", "0x04"]),
            "The owner signature has already been used."
        );
    });
})
