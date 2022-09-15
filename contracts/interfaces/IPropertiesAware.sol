// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity ^0.8.7;

interface IPropertiesAware {
    function getProperty(bytes32 key) external view returns (string memory);
    function setProperty(bytes32 key, string memory val_) external;
}
