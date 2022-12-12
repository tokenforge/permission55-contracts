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

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

abstract contract PermissionRoles is Context {
    // ***** Roles ********

    /// This role represents an administrator with full control over the contract
    uint256 public constant TOKEN_ROLE_ADMIN = 1;

    /// This role represents a deployer with certain permissions within the contract
    uint256 public constant TOKEN_ROLE_DEPLOYER = 2;

    /// This role represents an administrator with the ability to add or remove addresses from a whitelist.
    uint256 public constant TOKEN_ROLE_WHITELIST_ADMIN = 3;

    /// This role represents an administrator with the ability to add or remove addresses from a blacklist
    uint256 public constant TOKEN_ROLE_BLACKLIST_ADMIN = 4;

    /// This role represents an address with the ability to mint new tokens
    uint256 public constant TOKEN_ROLE_MINTER = 5;

    /// This role represents an address with the ability to transfer tokens
    uint256 public constant TOKEN_ROLE_TRANSFERER = 6;

    /// This role represents an operator with certain permissions within the contract
    uint256 public constant TOKEN_ROLE_OPERATOR = 7;

    /// This role represents an address that is whitelisted
    uint256 public constant TOKEN_ROLE_IS_WHITELISTED = 8;

    /// This role represents an address that is blacklisted
    uint256 public constant TOKEN_ROLE_IS_BLACKLISTED = 9;
}
