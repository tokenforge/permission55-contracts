// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity 0.8.16;

import "../PermissionSet.sol";

contract PermissionSetMock is PermissionSet {
    function addPermissionSet(uint256 id, string calldata name) external {
        _addPermissionSet(id, name);
    }

    function removePermissionSet(uint256 id) external {
        _removePermissionSet(id);
    }

    function registerPermissionSet(string calldata name) external {
        _registerPermissionSet(name);
    }
}
