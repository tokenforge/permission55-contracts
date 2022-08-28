// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity >=0.8.9 <0.9.0;

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
    uint256 public constant TOKEN_ROLE_IS_WHITELISTED = 7;
    uint256 public constant TOKEN_ROLE_IS_BLACKLISTED = 8;

    /**
     * @dev Modifier to make a function callable only when a specific role is met
     */
    modifier onlyRole(uint256 roleTokenId) {
        _checkRole(roleTokenId, _msgSender());
        _;
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

    function _hasRole(uint256 roleTokenId, address account) internal view virtual returns (bool);

    function hasRole(uint256 roleTokenId, address account) external view returns (bool) {
        return _hasRole(roleTokenId, account);
    }

    function hasRole(uint256 roleTokenId) external view returns (bool) {
        return _hasRole(roleTokenId, _msgSender());
    }
}
