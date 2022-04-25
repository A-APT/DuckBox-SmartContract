const truffleAssert = require('truffle-assertions')
const web3 = require('web3')
const ballot = artifacts.require("Ballot")

contract("Ballot_verify blind signature", function (accounts) {
    let instance = null
    it("is_verify_works_well", async function () {
        // get instance first
        instance = await ballot.deployed();
        let m = web3.utils.fromUtf8("0")
        let sig = BigInt("0x11e7b80d6e93e4e05046ceeecf7d455df4a5979ce4d591745cf271db6b32aea3")
        let Rx = BigInt("0x77ed80d9de7c800fd4a2b78d67b5dcfc18fad6e076356f10b2fb91bb8577320a")
        let Ry = BigInt("0xc1f3dd157fc5e9a7b96461723a20f28f12917ceca4a2c59d59c8d3adf5681cc9")
        await instance.verifySig(m, sig, [Rx, Ry], {gas: 30000000});
    })
    it("is_verify_reverts_when_invalid_sig", async function () {
        let m = web3.utils.fromUtf8("0")
        let sig = BigInt("0x11e7b80d6e93e4e05046ceeecf7d455df4a5979ce4d591745cf271db6b32ae03")
        let Rx = BigInt("0x77ed80d9de7c800fd4a2b78d67b5dcfc18fad6e076356f10b2fb91bb8577320a")
        let Ry = BigInt("0xc1f3dd157fc5e9a7b96461723a20f28f12917ceca4a2c59d59c8d3adf5681cc9")
        await truffleAssert.reverts(
            instance.verifySig(m, sig, [Rx, Ry], {gas: 30000000}),
            "revert Verify went wrong: x"
        );
    })
})
