// SPDX-License-Identifier: DuckBox
pragma solidity >=0.7.0 <0.9.0;

contract HelloWorld {
    string public greet = "Hello World!";
    function echo(string memory _input) external pure returns (string memory){
        return _input;
    }
}
