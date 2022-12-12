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

import "../PermissionSet.sol";

contract PermissionSetMock is PermissionSet {
    function addPermissionSet(uint256 id, string calldata name) external {
        _addPermissionSet(id, name);
    }

    function removePermissionSet(uint256 id) external {
        _removePermissionSet(id);
    }

    function registerPermissionSet(string calldata name) external {
        _registerPermissionSet(name);
    }
}
