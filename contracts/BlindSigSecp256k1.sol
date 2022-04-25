// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./EllipticCurve.sol";

library BlindSigSecp256k1 {

    uint256 constant N =         0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;
    uint256 constant Gx =        0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint256 constant Gy =        0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
    uint256 constant A =         0x0000000000000000000000000000000000000000000000000000000000000000;
    uint256 constant B =         0x0000000000000000000000000000000000000000000000000000000000000007;
    uint256 constant P =         0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;
    uint256 constant PUBKEYx =   0xd7bf79fbdfa2c473d86d2f5fb325c05a3f9815c6b6e3bd7c1b61780651be8be7;
    uint256 constant PUBKEYy =   0x79a09b8427069518535389161410ae45643588fd945919b9f53f6e1a5b98554f;

    function verifySig(bytes memory _m, uint256 _sig, uint256[2] memory _R) public pure {
        // calculate left-side
        uint256[2] memory left;
        (left[0], left[1]) = EllipticCurve.ecMul(_sig, Gx, Gy, A, P); // sG

        // calculate right-side
        uint256 h = uint(keccak256(_m));
        uint256 a = mulmod(_R[0], h, N); // (Rx * h) % N
        uint256[2] memory b;
        (b[0], b[1]) = EllipticCurve.ecMul(a, PUBKEYx, PUBKEYy, A, P);
        uint256[2] memory right;
        (right[0], right[1]) = EllipticCurve.ecAdd(_R[0], _R[1], b[0], b[1], A, P); // R + xRh(m)Pub

        require(left[0] == right[0], "Verify went wrong: x");
        require(left[1] == right[1], "Verify went wrong: y");
    }

    function verifySig(bytes memory _m, uint256 _sig, uint256[2] memory _R, uint256[2] memory _PUBKEY) public pure {
        // calculate left-side
        uint256[2] memory left;
        (left[0], left[1]) = EllipticCurve.ecMul(_sig, Gx, Gy, A, P); // sG

        // calculate right-side
        uint256 h = uint(keccak256(_m));
        uint256 a = mulmod(_R[0], h, N); // (Rx * h) % N
        uint256[2] memory b;
        (b[0], b[1]) = EllipticCurve.ecMul(a, _PUBKEY[0], _PUBKEY[1], A, P);
        uint256[2] memory right;
        (right[0], right[1]) = EllipticCurve.ecAdd(_R[0], _R[1], b[0], b[1], A, P); // R + xRh(m)Pub

        require(left[0] == right[0], "Verify went wrong: x");
        require(left[1] == right[1], "Verify went wrong: y");
    }
}
