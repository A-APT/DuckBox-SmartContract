const truffleAssert = require('truffle-assertions')
const web3 = require('web3')
const ballot = artifacts.require("Ballot")

contract("Ballot_verify blind signature", function (accounts) {
    let instance = null
    let startTime = Math.floor(Date.now() / 1000) + 2
    let endTime = startTime + 20
    it("is_verify_works_well", async function () {
        // get instance first
        instance = await ballot.deployed();
        let m = web3.utils.fromUtf8("test")
        let sig = BigInt("0x6247d87a95d3f4ebeaf4c7ab79b9d9e9ef5b7c7f4c37c41f645c57e1e2f24631")
        await instance.verifySig(m, sig, {gas:3000000});
    })
    it("is_verify_works_well_with_specify_R", async function () {
        // get instance first
        instance = await ballot.deployed();
        let m = web3.utils.fromUtf8("test")
        let sig = BigInt("0x6247d87a95d3f4ebeaf4c7ab79b9d9e9ef5b7c7f4c37c41f645c57e1e2f24631")
        let Rx = BigInt("0x546233c90e9a195806cd68b53255c075e17ab65b87d86cfa3c964b92b303b80e")
        let Ry = BigInt("0x1ae318011cffbd3cff2e1e9df8cdc1b48d291dc1c3cb93e1ef74104d0625483c")
        await instance.verifySig(m, sig, [Rx, Ry], {gas:3000000});
    })
})
