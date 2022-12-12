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

interface CregistryErrors {
    /// parameters length mismatch
    error ErrParametersLengthMismatch();

    /**
     * @dev Revert with an error when RoleId-overwrite did not changed anything
     */
    /// RoleId-overwrite did not changed anything
    error ErrRoleIdOverwriteNotChanged(uint256 roleId, bool overwrite);

    /**
     * @dev Revert with an error when value `val_` was already set before for the property `key`
     */
    /// The value `val_` was already set before for the property `key`
    /// @param key The name of the property
    /// @param val_ The value
    error NewValueIsEqualToOldValue(bytes32 key, string val_);

    /**
     * @dev Revert with an error when this PermissionSet has been already applied
     */
    /// This PermissionSet has been already applied
    error ErrPermissionSetIDWasAlreadySet();
}
