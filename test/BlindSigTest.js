const truffleAssert = require('truffle-assertions')
const web3 = require('web3')
const blindsig = artifacts.require("BlindSigSecp256k1")

contract("Ballot_verify blind signature", function (accounts) {
    let instance = null
    it("is_verify_works_well", async function () {
        // get instance first
        instance = await blindsig.deployed();
        let m = web3.utils.fromUtf8("0")
        let sig = BigInt("0x11e7b80d6e93e4e05046ceeecf7d455df4a5979ce4d591745cf271db6b32aea3")
        let Rx = BigInt("0x77ed80d9de7c800fd4a2b78d67b5dcfc18fad6e076356f10b2fb91bb8577320a")
        let Ry = BigInt("0xc1f3dd157fc5e9a7b96461723a20f28f12917ceca4a2c59d59c8d3adf5681cc9")
        await instance.verifySig(m, sig, [Rx, Ry]);
    })
    it("is_verify_reverts_when_invalid_sig", async function () {
        let m = web3.utils.fromUtf8("0")
        let sig = BigInt("0x11e7b80d6e93e4e05046ceeecf7d455df4a5979ce4d591745cf271db6b32ae03")
        let Rx = BigInt("0x77ed80d9de7c800fd4a2b78d67b5dcfc18fad6e076356f10b2fb91bb8577320a")
        let Ry = BigInt("0xc1f3dd157fc5e9a7b96461723a20f28f12917ceca4a2c59d59c8d3adf5681cc9")
        await truffleAssert.reverts(
            instance.verifySig(m, sig, [Rx, Ry]),
            "revert Verify went wrong: x"
        );
    })
    it("is_verify_with_specified_PUBKEY_works_well", async function () {
        let m = web3.utils.fromUtf8("0")
        let sig = BigInt("0xc466193572e1b5d2e63f503b69060b277055dbe1cb475819df4c282e9d68000a")
        let Rx = BigInt("0x77ed80d9de7c800fd4a2b78d67b5dcfc18fad6e076356f10b2fb91bb8577320a")
        let Ry = BigInt("0xc1f3dd157fc5e9a7b96461723a20f28f12917ceca4a2c59d59c8d3adf5681cc9")
        let PUBKEYx = BigInt("0x4719ded852f84728c0e25e2a7111e880f4ef516155f62e3db82be7b2981b0323")
        let PUBKEYy = BigInt("0xe84813d29f2125b707bc94244aec3c3d52a8025b5f7c988c92736daa22a621ac")
        await instance.verifySig(m, sig, [Rx, Ry], [PUBKEYx, PUBKEYy], {gas: 30000000});
    })
    it("is_verify_with_specified_PUBKEY_reverts_when_invalid_sig", async function () {
        // get instance first
        let m = web3.utils.fromUtf8("0")
        let sig = BigInt("0xc466193572e1b5d2e63f503b69060b277055dbe1cb475819df4c282e9d680000")
        let Rx = BigInt("0x77ed80d9de7c800fd4a2b78d67b5dcfc18fad6e076356f10b2fb91bb8577320a")
        let Ry = BigInt("0xc1f3dd157fc5e9a7b96461723a20f28f12917ceca4a2c59d59c8d3adf5681cc9")
        let PUBKEYx = BigInt("0x4719ded852f84728c0e25e2a7111e880f4ef516155f62e3db82be7b2981b0323")
        let PUBKEYy = BigInt("0xe84813d29f2125b707bc94244aec3c3d52a8025b5f7c988c92736daa22a621ac")
        await truffleAssert.reverts(
            instance.verifySig(m, sig, [Rx, Ry], [PUBKEYx, PUBKEYy], {gas: 30000000}),
            "revert Verify went wrong: x"
        );
    })
})
