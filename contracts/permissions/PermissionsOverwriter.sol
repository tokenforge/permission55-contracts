// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity ^0.8.7;

import "./PermissionsAware.sol";
import "../lib/CredistryErrors.sol";

contract PermissionsOverwriter is PermissionsAware, CredistryErrors {
    event SetRoleIdOverwritten(uint256 roleId, bool overwrite);

    uint256 public constant PERMISSION_ID_DELTA = 1000;

    event PermissionSetIdChanged(uint256 indexed oldPermissionSetId, uint256 indexed newPermissionSetId);

    uint256 private _permissionSetId;

    mapping(uint256 => bool) internal _overwrittenRoleIds;

    struct OverwriteRoleId {
        uint256 roleId;
        bool overwritten;
    }

    constructor(IPermissions55 permissions_, uint256 permissionSetId_) PermissionsAware(permissions_) {
        _permissionSetId = permissionSetId_;
    }

    function getPermissionSetId() external view returns (uint256) {
        return _permissionSetId;
    }

    function setPermissionSetId(uint256 permissionSetId) external onlyRole(TOKEN_ROLE_ADMIN) {
        if (_permissionSetId == permissionSetId) {
            revert ErrPermissionSetIDWasAlreadySet();
        }

        uint256 oldPermissionSetId = _permissionSetId;

        _permissionSetId = permissionSetId;

        uint256[4] memory roleIds = [
            TOKEN_ROLE_MINTER,
            TOKEN_ROLE_WHITELIST_ADMIN,
            TOKEN_ROLE_TRANSFERER,
            TOKEN_ROLE_IS_WHITELISTED
        ];

        for (uint256 i = 0; i < 4; ++i) {
            if (oldPermissionSetId > 0) {
                // cleaning up old custom role tokens
                removeCustomRoleToken(roleIds[i], transformedRoleId(oldPermissionSetId, roleIds[i]));
            }
            addCustomRoleToken(roleIds[i], transformedRoleId(permissionSetId, roleIds[i]));
        }

        emit PermissionSetIdChanged(oldPermissionSetId, permissionSetId);
    }

    function transformedRoleId(uint256 permissionSetId_, uint256 roleId) public pure returns (uint256) {
        return permissionSetId_ * PERMISSION_ID_DELTA + roleId;
    }

    function isRoleIdOverwritten(uint256 roleId) public view returns (bool) {
        return _overwrittenRoleIds[roleId];
    }

    function setRoleIdOverwrite(uint256 roleId, bool overwrite) public {
        if (_overwrittenRoleIds[roleId] == overwrite) {
            revert ErrRoleIdOverwriteNotChanged(roleId, overwrite);
        }

        _overwrittenRoleIds[roleId] = overwrite;
        emit SetRoleIdOverwritten(roleId, overwrite);

        if (roleId == TOKEN_ROLE_WHITELIST_ADMIN) {
            _overwrittenRoleIds[TOKEN_ROLE_IS_WHITELISTED] = overwrite;
            emit SetRoleIdOverwritten(TOKEN_ROLE_IS_WHITELISTED, overwrite);
        } else if (roleId == TOKEN_ROLE_BLACKLIST_ADMIN) {
            _overwrittenRoleIds[TOKEN_ROLE_IS_BLACKLISTED] = overwrite;
            emit SetRoleIdOverwritten(TOKEN_ROLE_IS_BLACKLISTED, overwrite);
        }
    }

    // Check if this was overwritten or not
    function _hasRole(uint256 roleTokenId, address account) internal view virtual override returns (bool) {
        if (super._hasRole(roleTokenId, account)) {
            return true;
        }

        if (_overwrittenRoleIds[roleTokenId]) {
            return super._hasRole(transformedRoleId(_permissionSetId, roleTokenId), account);
        }

        return false;
    }
}