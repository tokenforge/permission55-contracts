// SPDX-License-Identifier: None
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

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract BlackList is Context, AccessControlEnumerable {
    bytes32 public constant BLACKLIST_ROLE = keccak256("BLACKLIST");
    bytes32 public constant BLACKLIST_ADMIN_ROLE = keccak256("BLACKLIST_ADMIN");

    constructor() {
        _setupRole(BLACKLIST_ADMIN_ROLE, _msgSender());
        _setRoleAdmin(BLACKLIST_ROLE, BLACKLIST_ADMIN_ROLE);
    }

    function addToBlackList(address beneficiary) public {
        grantRole(BLACKLIST_ROLE, beneficiary);
    }

    function removeFromBlackList(address beneficiary) public {
        revokeRole(BLACKLIST_ROLE, beneficiary);
    }

    function isBlacklisted(address beneficiary) public view returns (bool) {
        return hasRole(BLACKLIST_ROLE, beneficiary);
    }

    function grantBlackListerRole(address blacklister) public {
        grantRole(BLACKLIST_ADMIN_ROLE, blacklister);
    }

    function revokeBlackListerRole(address blacklister) public {
        revokeRole(BLACKLIST_ADMIN_ROLE, blacklister);
    }

    function isBlackLister(address blacklister) public view returns (bool) {
        return hasRole(BLACKLIST_ADMIN_ROLE, blacklister);
    }
}
