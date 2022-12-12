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

import "../permissions/PermissionRoles.sol";
import "../lib/CregistryErrors.sol";
import "../interfaces/IPropertiesAware.sol";
import "../permissions/PermissionsAware.sol";

abstract contract PropertiesAware is PermissionsAware, CregistryErrors, IPropertiesAware {
    event PropertyChanged(bytes32 indexed propertyName, bytes oldValue, bytes newValue);

    mapping(bytes32 => string) internal _properties;

    function getProperty(bytes32 key) public view override returns (string memory) {
        return _properties[key];
    }

    function setProperty(bytes32 key, string memory val_) public override onlyRole(TOKEN_ROLE_ADMIN) {
        string memory oldValue = _properties[key];

        if (keccak256(bytes(oldValue)) == keccak256(bytes(val_))) {
            revert NewValueIsEqualToOldValue(key, val_);
        }

        _properties[key] = val_;

        emit PropertyChanged(key, bytes(oldValue), bytes(val_));
    }
}
