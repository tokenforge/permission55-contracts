// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io
pragma solidity ^0.8.7;

interface CregistryErrors {
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
