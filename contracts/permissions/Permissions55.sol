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

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

import "../lib/solstruct/LibSet.uint256.sol";
import "../lib/solstruct/LibSet.address.sol";
import "../lib/solstruct/LibMap.bytes32.string.sol";
import "../lib/solstruct/LibMap.uint256.string.sol";

import "./PermissionRoles.sol";
import "./IPermissions55.sol";
import "./PermissionSet.sol";
import "./PermissionErrors.sol";

contract Permissions55 is
    Context,
    ERC1155Burnable,
    ERC1155Supply,
    IPermissions55,
    PermissionRoles,
    PermissionSet,
    PermissionErrors
{
    using LibSet_uint256 for LibSet_uint256.set;
    using LibSet_address for LibSet_address.set;
    using LibMap_uint256_string for LibMap_uint256_string.map;

    // **** Events *****
    event TokenUriChanged(uint256 indexed tokenId, string oldValue, string newValue);

    // **** Token Members ****
    mapping(uint256 => LibSet_address.set) private _tokenMembers;

    mapping(uint256 => string) private _tokenUris;

    uint256 private _counter;

    // Contract name. Etherscan.io compatibility and OpenSea ("Unknown contract")
    string public name;

    modifier onlyDeployer() {
        if (balanceOf(_msgSender(), TOKEN_ROLE_ADMIN) == 0 && balanceOf(_msgSender(), TOKEN_ROLE_DEPLOYER) == 0) {
            revert ErrAdminOrDeployerRolesRequired(_msgSender());
        }

        _;
    }

    modifier onlyMintingRole(uint256 id) {
        (bool success, uint256 requiredPermission) = checkMintingPermissions(_msgSender(), id);

        if (!success) {
            revert ErrMissingRole({account: _msgSender(), roleId: id, requiredPermission: requiredPermission});
        }

        _;
    }

    modifier onlyAdmin(uint256 tokenId) {
        uint256 permissionSetId = tokenId / 1000;

        if (!isAdmin(_msgSender(), permissionSetId)) {
            revert ErrAdminRoleRequired(_msgSender(), permissionSetId);
        }

        _;
    }

    // @TODO check base URI in Ctor.
    constructor(string memory adminTokenUri) ERC1155("ipfs://QmdTkLguthw5aofVxXY52EiKgAQQJDQv8mpBF6hk1Pf2Mg") {
        name = "TokenForge-Permission55";
        _create(_msgSender(), TOKEN_ROLE_ADMIN, adminTokenUri);
    }

    function getCounter() public view returns (uint256) {
        return _counter;
    }

    function incCounter() public {
        _counter++;
    }

    function addPermissionSet(uint256 id, string calldata name) external onlyDeployer {
        _addPermissionSet(id, name);
    }

    function removePermissionSet(uint256 id) external onlyDeployer {
        _removePermissionSet(id);
    }

    function registerPermissionSet(string calldata name) external onlyDeployer {
        _registerPermissionSet(name);
    }

    function balanceOf(address account, uint256 id)
        public
        view
        virtual
        override(ERC1155, IPermissions55)
        returns (uint256)
    {
        return super.balanceOf(account, id);
    }

    function uri(uint256 id) public view virtual override returns (string memory) {
        return _tokenUris[id];
    }

    function setTokenUri(uint256 id, string calldata tokenUri) external onlyAdmin(id) {
        string memory oldUri = _tokenUris[id];
        _tokenUris[id] = tokenUri;

        emit TokenUriChanged(id, oldUri, tokenUri);
    }

    function create(
        address to,
        uint256 id,
        string memory tokenUri
    ) public onlyMintingRole(id) {
        if (exists(id)) {
            revert ErrTokenAlreadyCreated(id);
        }

        _create(to, id, tokenUri);
    }

    function _create(
        address to,
        uint256 id,
        string memory tokenUri
    ) internal {
        _tokenUris[id] = tokenUri;
        _mint(to, id);
    }

    function mint(address to, uint256 id) public onlyMintingRole(id) {
        if (!exists(id)) {
            revert ErrTokenNotCreatedYet(id);
        }

        _mint(to, id);
    }

    function _mint(address to, uint256 id) internal {
        bytes memory data = new bytes(0);
        _mint(to, id, 1, data);
    }

    function mintOneBatch(address[] memory tos, uint256 id) public onlyMintingRole(id) {
        if (!exists(id)) {
            revert ErrTokenNotCreatedYet(id);
        }

        for (uint256 i = 0; i < tos.length; i++) {
            _mint(tos[i], id);
        }
    }

    function mintBatch(address[] memory tos, uint256[] memory ids) public {
        if (ids.length != tos.length) {
            revert ErrParametersLengthMismatch();
        }

        // First check permissions and that all tokenIds already exists and minting is allowed
        for (uint256 i = 0; i < tos.length; i++) {
            // 1. then check if token was already created
            if (!exists(ids[i])) {
                revert ErrTokenNotCreatedYet(ids[i]);
            }

            if (!exists(ids[i])) {
                revert ErrTokenNotCreatedYet(ids[i]);
            }

            // 2. is minting allowed
            (bool success, uint256 requiredPermission) = checkMintingPermissions(msg.sender, ids[i]);
            if (!success) {
                revert ErrMissingRole({account: msg.sender, roleId: ids[i], requiredPermission: requiredPermission});
            }
        }

        // now lets mint
        for (uint256 i = 0; i < tos.length; i++) {
            _mint(tos[i], ids[i]);
        }
    }

    function createOrMint(
        address to,
        uint256 id,
        string memory tokenUri
    ) public onlyMintingRole(id) {
        if (!exists(id)) {
            _create(to, id, tokenUri);
        } else {
            _mint(to, id);
        }
    }

    function ownersOf(uint256 tokenId) external view returns (address[] memory) {
        return _tokenMembers[tokenId].content();
    }

    function getTokenMember(uint256 tokenId, uint256 index) public view returns (address) {
        return _tokenMembers[tokenId].at(index);
    }

    /**
     * @dev Returns the number of accounts that have `role`. Can be used
     * together with {getRoleMember} to enumerate all bearers of a role.
     */
    function getTokenMemberCount(uint256 tokenId) public view returns (uint256) {
        return _tokenMembers[tokenId].length();
    }

    function checkMintingPermissions(address account, uint256 tokenId)
        public
        view
        returns (bool success, uint256 requiredPermission)
    {
        uint256 permissionSetId = tokenId / 1000;
        uint256 roleId = tokenId % 1000;

        if (isAdmin(account, permissionSetId)) {
            return (true, TOKEN_ROLE_ADMIN);
        }

        // To be improved ...
        if (
            roleId == TOKEN_ROLE_ADMIN ||
            roleId == TOKEN_ROLE_DEPLOYER ||
            roleId == TOKEN_ROLE_OPERATOR ||
            roleId == TOKEN_ROLE_MINTER ||
            roleId == TOKEN_ROLE_TRANSFERER ||
            roleId == TOKEN_ROLE_WHITELIST_ADMIN ||
            roleId == TOKEN_ROLE_BLACKLIST_ADMIN
        ) {
            //slither-disable-next-line divide-before-multiply
            return (
                balanceOf(account, TOKEN_ROLE_ADMIN) > 0 ||
                    balanceOf(account, TOKEN_ROLE_ADMIN + 1000 * permissionSetId) > 0,
                TOKEN_ROLE_ADMIN
            );
        }

        if (roleId == TOKEN_ROLE_IS_WHITELISTED) {
            //slither-disable-next-line divide-before-multiply
            return (
                balanceOf(account, TOKEN_ROLE_WHITELIST_ADMIN) > 0 ||
                    balanceOf(account, TOKEN_ROLE_WHITELIST_ADMIN + 1000 * permissionSetId) > 0,
                TOKEN_ROLE_WHITELIST_ADMIN
            );
        }

        if (roleId == TOKEN_ROLE_IS_BLACKLISTED) {
            //slither-disable-next-line divide-before-multiply
            return (
                balanceOf(account, TOKEN_ROLE_BLACKLIST_ADMIN) > 0 ||
                    balanceOf(account, TOKEN_ROLE_BLACKLIST_ADMIN + 1000 * permissionSetId) > 0,
                TOKEN_ROLE_BLACKLIST_ADMIN
            );
        }

        return (false, TOKEN_ROLE_ADMIN);
    }

    function isAdmin(address account, uint256 permissionSetId) public view returns (bool) {
        return
            balanceOf(account, TOKEN_ROLE_ADMIN) > 0 ||
            balanceOf(account, TOKEN_ROLE_ADMIN + permissionSetId * 1000) > 0;
    }

    function burnAs(address account, uint256 id) public onlyAdmin(id) {
        _burn(account, id, balanceOf(account, id));
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning, as well as batched variants.
     *
     * The same hook is called on both single and batched variants. For single
     * transfers, the length of the `id` and `amount` arrays will be 1.
     *
     * Calling conditions (for each `id` and `amount` pair):
     *
     * - When `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * of token type `id` will be  transferred to `to`.
     * - When `from` is zero, `amount` tokens of token type `id` will be minted
     * for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens of token type `id`
     * will be burned.
     * - `from` and `to` are never both zero.
     * - `ids` and `amounts` have the same, non-zero length.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        if (from == address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 id = ids[i];

                if (balanceOf(to, id) > 0) {
                    revert ErrTokenAlreadyExists(to, id);
                }

                _tokenMembers[id].add(to);
            }

            // issuing is okay
            return;
        }
        if (from != address(0) && to == address(0)) {
            // burn is okay
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 id = ids[i];

                _tokenMembers[id].remove(from);
            }

            return;
        }

        // transfer is not permitted.
        revert ErrTransferNotAllowed();
    }
}
