var hello = artifacts.require("HelloWorld")

contract("HelloWorld", function () {
    it ("is_greet_works_well", async function () {
        const instance = await hello.deployed();
        const response = await instance.greet();
        assert.equal(response, "Hello World!", "greeting message is wrong");
    })
    it ("is_echo_works_well_async", async function () {
        const instance = await hello.deployed();
        const message = "testing";
        const response = await instance.echo(message);
        assert.equal(response, message);
    })
    it ("is_echo_works_well_promise", function () {
        return hello.deployed().then(function(instance) {
            const message = "testing";
            instance.echo(message).then(function (response) {
                assert.equal(response, message);
            })
        })
    })
})
