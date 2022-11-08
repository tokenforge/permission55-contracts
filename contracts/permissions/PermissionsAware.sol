// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity ^0.8.7;

import "../lib/solstruct/LibSet.uint256.sol";

import "./PermissionRoles.sol";
import "./IPermissions55.sol";

abstract contract PermissionsAware is PermissionRoles {
    using LibSet_uint256 for LibSet_uint256.set;

    IPermissions55 internal _permissions;

    event PermissionsChanged(IPermissions55 indexed oldValue, IPermissions55 indexed newValue);

    /**
     * @dev Modifier to make a function callable only when a specific role is met
     */
    modifier onlyRole(uint256 roleTokenId) {
        _checkRole(roleTokenId, _msgSender());
        _;
    }

    constructor(IPermissions55 permissions_) {
        _permissions = permissions_;
    }

    function _changePermissions55(IPermissions55 permissions_) internal {
        IPermissions55 old = _permissions;
        if (_permissions != permissions_) {
            _permissions = permissions_;
            emit PermissionsChanged(old, _permissions);
        }
    }

    function permissions() public view returns (IPermissions55) {
        return _permissions;
    }

    function _hasRole(uint256 tokenId, address account) internal view virtual returns (bool) {
        if (_permissions.balanceOf(account, tokenId) > 0) {
            return true;
        }

        return false;
    }

    /**
     * @dev Revert with a standard message if `_msgSender()` is missing `roleTokenId`.
     * Overriding this function changes the behavior of the {onlyRole} modifier.
     *
     * Format of the revert message is described in {_checkRole}.
     *
     * _Available since v4.6._
     */
    function _checkRole(uint256 roleTokenId) internal view virtual {
        _checkRole(roleTokenId, _msgSender());
    }

    /**
     * @dev Revert with a standard message if `account` is missing `roleTokenId`.
     *
     * The format of the revert reason is given by the following regular expression:
     *
     *  /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/
     */
    function _checkRole(uint256 roleTokenId, address account) internal view virtual {
        if (!_hasRole(roleTokenId, account) && !_hasRole(TOKEN_ROLE_ADMIN, account)) {
            revert(
                string(
                    abi.encodePacked(
                        "AccessControl: account ",
                        Strings.toHexString(uint160(account), 20),
                        " is missing role ",
                        Strings.toHexString(roleTokenId)
                    )
                )
            );
        }
    }

    function hasRole(uint256 tokenId, address account) external view returns (bool) {
        return _hasRole(tokenId, account);
    }

    function hasRole(uint256 tokenId) external view returns (bool) {
        return _hasRole(tokenId, _msgSender());
    }
}
