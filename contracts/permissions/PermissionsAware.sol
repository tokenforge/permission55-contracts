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

    mapping(uint256 => LibSet_uint256.set) private _customRoleTokens;

    event CustomRoleTokenAdded(uint256 indexed roleTokenId, uint256 indexed tokenId);
    event CustomRoleTokenRemoved(uint256 indexed roleTokenId, uint256 indexed tokenId);

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

    function addCustomRoleToken(uint256 roleTokenId, uint256 tokenId) public {
        _customRoleTokens[roleTokenId].add(tokenId);

        emit CustomRoleTokenAdded(roleTokenId, tokenId);
    }

    function removeCustomRoleToken(uint256 roleTokenId, uint256 tokenId) public {
        _customRoleTokens[roleTokenId].remove(tokenId);

        emit CustomRoleTokenRemoved(roleTokenId, tokenId);
    }

    function getCustomRoleTokenAt(uint256 roleTokenId, uint256 position) public view returns (uint256) {
        return _customRoleTokens[roleTokenId].values[position];
    }

    function getCustomRoleTokenCount(uint256 roleTokenId) public view returns (uint256) {
        return _customRoleTokens[roleTokenId].length();
    }

    function getCustomRoleTokens(uint256 roleTokenId) public view returns (uint256[] memory) {
        return _customRoleTokens[roleTokenId].content();
    }

    function _hasRole(uint256 roleTokenId, address account) internal view virtual override returns (bool) {
        if (_permissions.balanceOf(account, roleTokenId) > 0) {
            return true;
        }

        for (uint256 i = 0; i < _customRoleTokens[roleTokenId].length(); i++) {
            if (_permissions.balanceOf(account, _customRoleTokens[roleTokenId].at(i + 1)) > 0) {
                return true;
            }
        }

        return false;
    }
}
