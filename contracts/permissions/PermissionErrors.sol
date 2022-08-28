// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io
pragma solidity ^0.8.7;

interface PermissionErrors {
    /**
     * @dev Revert with an error when an `account` is missing role #`roleId`
     */
    /// AccessControl: `account` is missing role #`roleId`
    /// @param account the account that requires the role.
    /// @param roleId the ID of the required role
    error ErrMissingRole(address account, uint256 roleId);

    /**
     * @dev Revert with an error when an Admin Role is required for this action
     */
    /// Admin Role is required for this action
    error ErrAdminRoleRequired();
}
