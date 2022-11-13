// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity 0.8.16;

import "../PermissionsAware.sol";

contract PermissionsAwareMock is PermissionsAware {
    constructor(IPermissions55 permissions_) PermissionsAware(permissions_) {}
}
