// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity ^0.8.7;

import "../lib/solstruct/LibSet.uint256.sol";
import "../lib/solstruct/LibSet.address.sol";
import "../lib/solstruct/LibMap.bytes32.string.sol";
import "../lib/solstruct/LibMap.uint256.string.sol";

contract PermissionSet {
    using LibSet_uint256 for LibSet_uint256.set;
    using LibSet_address for LibSet_address.set;
    using LibMap_uint256_string for LibMap_uint256_string.map;

    event PermissionSetAdded(uint256 indexed id, string indexed name);
    event PermissionSetRemoved(uint256 indexed id);

    uint256 private _nextPermissionSetId = 1; // we start with 1 because 0 is default for Default Set
    LibMap_uint256_string.map private _permissionSets;

    constructor() {}

    function permissionSet(uint256 id) external view returns (string memory) {
        return _permissionSets.get(id);
    }

    function permissionSetIds() external view returns (uint256[] memory) {
        return _permissionSets.keys();
    }

    function permissionSets() external view returns (uint256[] memory, string[] memory) {
        uint256[] memory keys = _permissionSets.keys();
        string[] memory values = new string[](keys.length);

        for (uint256 i = 0; i < keys.length; i++) {
            values[i] = _permissionSets.get(i + 1);
        }
        return (keys, values);
    }

    function _addPermissionSet(uint256 id, string calldata name) internal virtual {
        require(!_permissionSets.contains(id), "PermissionSet already exists with that ID");
        _permissionSets.set(id, name);

        emit PermissionSetAdded(id, name);
    }

    function _removePermissionSet(uint256 id) internal virtual {
        require(_permissionSets.contains(id), "PermissionSet is not existing");
        _permissionSets.del(id);

        emit PermissionSetRemoved(id);
    }

    function _registerPermissionSet(string calldata name) internal virtual {
        uint256 id = _nextPermissionSetId;
        _addPermissionSet(id, name);
        unchecked {
            _nextPermissionSetId++;
        }
    }

    function nextPermissionSetId() external view returns (uint256) {
        return _nextPermissionSetId;
    }
}
