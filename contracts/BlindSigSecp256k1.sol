// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;
import "elliptic-curve-solidity/contracts/EllipticCurve.sol";

library BlindSigSecp256k1 {

    uint256 constant N =         0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;
    uint256 constant Gx =        0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint256 constant Gy =        0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
    uint256 constant A =         0x0000000000000000000000000000000000000000000000000000000000000000;
    uint256 constant B =         0x0000000000000000000000000000000000000000000000000000000000000007;
    uint256 constant P =         0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;
    uint256 constant PUBKEYx =   0x7b3603b13efe830a672de384b1afc369f3e9800727ed4585db291ee6a75807a4;
    uint256 constant PUBKEYy =   0x4c89be9b5e3e54ebe7dc11f7f3dd29204078a89a35f04258841aee5ca3d59a44;
    uint256 constant Rx =        0x546233c90e9a195806cd68b53255c075e17ab65b87d86cfa3c964b92b303b80e;
    uint256 constant Ry =        0x1ae318011cffbd3cff2e1e9df8cdc1b48d291dc1c3cb93e1ef74104d0625483c;

    function verifySig(bytes memory m, uint256 sig) external view {
        // calculate left-side
        uint256[2] memory left;
        (left[0], left[1]) = EllipticCurve.ecMul(sig, Gx, Gy, A, P);// sG

        // calculate right-side
        uint256 h = uint(keccak256(m));
        uint a = (Rx * h) % N;
        uint256[2] memory b;
        (b[0], b[1]) = EllipticCurve.ecMul(a, PUBKEYx, PUBKEYy, A, P);
        uint256[2] memory right;
        (right[0], right[1]) = EllipticCurve.ecAdd(Rx, Ry, b[0], b[1], A, P); // R + xRh(m)Pub

        require(left[0] == right[0], "Verify went wrong: x");
        require(left[1] == right[1], "Verify went wrong: y");
    }

    function verifySig(bytes memory m, uint256 sig, uint256[2] memory R) external view {
        // calculate left-side
        uint256[2] memory left;
        (left[0], left[1]) = EllipticCurve.ecMul(sig, Gx, Gy, A, P);// sG

        // calculate right-side
        uint256 h = uint(keccak256(m));
        uint a = (R[0] * h) % N;
        uint256[2] memory b;
        (b[0], b[1]) = EllipticCurve.ecMul(a, PUBKEYx, PUBKEYy, A, P);
        uint256[2] memory right;
        (right[0], right[1]) = EllipticCurve.ecAdd(R[0], R[1], b[0], b[1], A, P); // R + xRh(m)Pub

        require(left[0] == right[0], "Verify went wrong: x");
        require(left[1] == right[1], "Verify went wrong: y");
    }
}
