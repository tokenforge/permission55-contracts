// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity ^0.8.7;

import "../permissions/PermissionRoles.sol";
import "../lib/CredistryErrors.sol";
import "../interfaces/IPropertiesAware.sol";

abstract contract PropertiesAware is PermissionRoles, CredistryErrors, IPropertiesAware {
    event PropertyChanged(bytes32 indexed propertyName, bytes oldValue, bytes newValue);

    mapping(bytes32 => string) internal _properties;

    function getProperty(bytes32 key) public view returns (string memory) {
        return _properties[key];
    }

    function setProperty(bytes32 key, string memory val_) public onlyRole(TOKEN_ROLE_ADMIN) {
        string memory oldValue = _properties[key];

        if (keccak256(bytes(oldValue)) == keccak256(bytes(val_))) {
            revert NewValueIsEqualToOldValue(key, val_);
        }

        _properties[key] = val_;

        emit PropertyChanged(key, bytes(oldValue), bytes(val_));
    }
}
