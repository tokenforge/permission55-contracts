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

import "../lib/CregistryErrors.sol";

interface PermissionErrors is CregistryErrors {

    /// Transfer is not allowed
    error ErrTransferNotAllowed();

    /**
     * @dev Revert with an error when an `account` is missing role #`roleId`
     */
    /// AccessControl: `account` is missing role #`roleId`
    /// @param account the account that requires the role.
    /// @param roleId the ID of the requested role
    /// @param requiredPermission the ID of the required role
    error ErrMissingRole(address account, uint256 roleId, uint256 requiredPermission);

    /**
     * @dev Revert with an error when an Admin Role is required for this action
     */
    /// Admin Role is required for this action
    /// @param sender the sender that requires the role.
    /// @param permissionSetId the ID of the requested permissionSet
    error ErrAdminRoleRequired(address sender, uint256 permissionSetId);

    /// A token with `tokenId` already exists in this account
    /// @param beneficiary The beneficiary of the token
    /// @param tokenId ID of Token
    error ErrTokenAlreadyExists(address beneficiary, uint256 tokenId);

    /// The token has already been created yet
    /// @param tokenId ID of Token
    error ErrTokenAlreadyCreated(uint256 tokenId);

    /// The token with ID `tokenId` has not been created yet
    /// @param tokenId ID of Token
    error ErrTokenNotCreatedYet(uint256 tokenId);

    /// Admin or Deployer roles required
    /// @param sender the sender that requires the role.
    error ErrAdminOrDeployerRolesRequired(address sender);
}
