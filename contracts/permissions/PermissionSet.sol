// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io
/**
 * @dev Learn more about this on https://token-forge.io
 

 _______    _              ______                   
|__   __|  | |            |  ____|                  
   | | ___ | | _____ _ __ | |__ ___  _ __ __ _  ___ 
   | |/ _ \| |/ / _ \ '_ \|  __/ _ \| '__/ _` |/ _ \
   | | (_) |   <  __/ | | | | | (_) | | | (_| |  __/
   |_|\___/|_|\_\___|_| |_|_|  \___/|_|  \__, |\___|
                                          __/ |     
                                         |___/      

 */

pragma solidity 0.8.16;

import "../lib/solstruct/LibSet.uint256.sol";
import "../lib/solstruct/LibSet.address.sol";
import "../lib/solstruct/LibMap.bytes32.string.sol";
import "../lib/solstruct/LibMap.uint256.string.sol";

interface PermissionSetErrors {
    /// PermissionSet already exists with that ID
    /// @param id ID of PermissionSet
    error ErrPermissionSetAlreadyExists(uint256 id);

    /// PermissionSet with that name already exists
    /// @param name Name of PermissionSet
    error ErrPermissionSetWithSameNameAlreadyExists(string name);

    /// PermissionSet is not existing
    /// @param id ID of PermissionSet
    error ErrPermissionSetIsNotExisting(uint256 id);
}

/**
 * @dev Smart Contract for managing a set of permission sets. It includes an interface for error handling, a contract
 * for the PermissionSet, and various functions for interacting with the permission sets.
 *
 * The contract includes several events that are emitted when permission sets are added or removed, and it also
 * includes functions for adding and removing permission sets, as well as functions for retrieving information
 * about permission sets.
 */
contract PermissionSet is PermissionSetErrors {
    using LibMap_uint256_string for LibMap_uint256_string.map;

    event PermissionSetAdded(uint256 indexed id, string indexed name);
    event PermissionSetRemoved(uint256 indexed id);

    uint256 private _nextPermissionSetId = 1; // we start with 1 because 0 is default for Default Set
    LibMap_uint256_string.map private _permissionSets;

    mapping(bytes32 => bool) private _existingNames;

    constructor() {}

    /**
     * @return string Returns the name of a permission set given its ID,
     */
    function permissionSet(uint256 id) external view returns (string memory) {
        return _permissionSets.get(id);
    }

    /**
     * @return uint256[] memory returns an array of all permission set IDs
     */
    function permissionSetIds() external view returns (uint256[] memory) {
        return _permissionSets.keys();
    }

    /**
     * @dev returns an array of all permission sets and their respective IDs.
     */
    function permissionSets() external view returns (uint256[] memory, string[] memory) {
        uint256[] memory keys = _permissionSets.keys();
        string[] memory values = new string[](keys.length);

        for (uint256 i = 0; i < keys.length; i++) {
            values[i] = _permissionSets.get(i + 1);
        }
        return (keys, values);
    }

    /// ---- Helper Functions -----

    function _addPermissionSet(uint256 id, string calldata name_) internal virtual {
        if (_permissionSets.contains(id)) {
            revert ErrPermissionSetAlreadyExists(id);
        }

        bytes32 hash = keccak256(abi.encodePacked(name_));

        if (_existingNames[hash] == true) {
            revert ErrPermissionSetWithSameNameAlreadyExists(name_);
        }

        //slither-disable-next-line unused-return
        _permissionSets.set(id, name_);

        _existingNames[hash] = true;

        emit PermissionSetAdded(id, name_);
    }

    function _removePermissionSet(uint256 id) internal virtual {
        if (!_permissionSets.contains(id)) {
            revert ErrPermissionSetIsNotExisting(id);
        }

        //slither-disable-next-line unused-return
        _permissionSets.del(id);

        emit PermissionSetRemoved(id);
    }

    /**
     * @dev Allows to register a new permission set by providing a name and generating an ID.
     */
    function _registerPermissionSet(string calldata name_) internal virtual {
        uint256 id = _nextPermissionSetId;
        _addPermissionSet(id, name_);
        unchecked {
            _nextPermissionSetId++;
        }
    }

    /**
     * @return uint256 returns the next permission set ID that will be assigned.
     */
    function nextPermissionSetId() external view returns (uint256) {
        return _nextPermissionSetId;
    }
}
