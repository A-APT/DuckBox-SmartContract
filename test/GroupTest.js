const truffleAssert = require('truffle-assertions')
const group = artifacts.require("Group")

contract("Group", function (accounts){
    it("is_user_works_well", async function(){
        let instance = await group.deployed();
        let owner = await instance.owner();

        assert.equal(
            owner.valueOf(),
            accounts[0],
            "Does not match owner"
        )
    });

    it("is_requestMember_works_well", async() => {
        //arrange
        let instance = await group.deployed();
        const userDid = "testing";

        //act
        await instance.requestMember(userDid);

        //check
        let count = await instance.getCount(userDid);
        assert.equal(count, 0, "not equal count");
    });

    it("is_approveMember_works_well", async() => {
        //arrange
        let instance = await group.deployed();
        const userDid = "testing";
        await instance.setVaild(userDid, true)

        const userDid2 = "testing2";
        await instance.requestMember(userDid2);

        //act
        await instance.approveMember(userDid, userDid2);

        //check
        let count = await instance.getCount(userDid2);
        assert.equal(count, 1, "not equal count");
    });
})
