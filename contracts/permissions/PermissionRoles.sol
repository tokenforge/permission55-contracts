// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

abstract contract PermissionRoles is Context {
    // ***** Roles ********
    uint256 public constant TOKEN_ROLE_ADMIN = 1;
    uint256 public constant TOKEN_ROLE_DEPLOYER = 2;
    uint256 public constant TOKEN_ROLE_WHITELIST_ADMIN = 3;
    uint256 public constant TOKEN_ROLE_BLACKLIST_ADMIN = 4;
    uint256 public constant TOKEN_ROLE_MINTER = 5;
    uint256 public constant TOKEN_ROLE_TRANSFERER = 6;
    uint256 public constant TOKEN_ROLE_OPERATOR = 7;
    uint256 public constant TOKEN_ROLE_IS_WHITELISTED = 8;
    uint256 public constant TOKEN_ROLE_IS_BLACKLISTED = 9;
}
