// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity ^0.8.7;

import "hardhat/console.sol";

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

    // **** Error messages *****

    string public constant ERROR_TOKEN_ALREADY_EXISTS = "Permissions55: Token already minted";
    string public constant ERROR_TRANSFER_IS_NOT_ALLOWED = "Permissions55: Transfer is not allowed";
    string public constant ERROR_PERMISSION_DENIED = "Permissions55: not allowed due to missing permissions";

    // **** Token Members ****
    mapping(uint256 => LibSet_address.set) private _tokenMembers;

    mapping(uint256 => string) private _tokenUris;

    uint256 private _counter;

    modifier onlyDeployer() {
        require(
            balanceOf(_msgSender(), TOKEN_ROLE_ADMIN) > 0 || balanceOf(_msgSender(), TOKEN_ROLE_DEPLOYER) > 0,
            "Permission55: Admin or Deployer roles required"
        );
        _;
    }

    modifier onlyMintingRole(uint256 id) {
        (bool success, uint256 requiredPermission) = checkMintingPermissions(_msgSender(), id);

        if (!success) {
            revert ErrMissingRole({account: _msgSender(), roleId: id});
        }

        _;
    }

    modifier onlyAdmin(uint256 tokenId) {
        uint256 permissionSetId = tokenId / 1000;

        if (!isAdmin(_msgSender(), permissionSetId)) {
            revert ErrAdminRoleRequired();
        }

        _;
    }

    // @TODO check base URI in Ctor.
    constructor(string memory adminTokenUri) ERC1155("ipfs://QmdQNC9ASzTCGwrRYqx4MfKWx1M7JAX4bq1x15nBM9Wc1Q") {
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
        _tokenUris[id] = tokenUri;
    }

    function create(
        address to,
        uint256 id,
        string memory tokenUri
    ) public onlyMintingRole(id) {
        require(!exists(id), "The token has already been created yet");

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
        require(exists(id), "The token has not been created yet");

        _mint(to, id);
    }

    function _mint(address to, uint256 id) internal {
        bytes memory data = new bytes(0);
        _mint(to, id, 1, data);
    }

    function mintOneBatch(address[] memory tos, uint256 id) public onlyMintingRole(id) {
        require(exists(id), "The token has not been created yet");

        for (uint256 i = 0; i < tos.length; i++) {
            _mint(tos[i], id);
        }
    }

    function mintBatch(address[] memory tos, uint256[] memory ids) public {
        require(ids.length == tos.length, "Permission55: parameters length mismatch");

        // First check permissions and that all tokenIds already exists
        for (uint256 i = 0; i < tos.length; i++) {
            require(exists(ids[i]), "Permission55: the token has not been created yet");

            (bool success, ) = checkMintingPermissions(msg.sender, ids[i]);
            if (!success) {
                revert ErrMissingRole({account: msg.sender, roleId: ids[i]});
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
            return (
                balanceOf(account, TOKEN_ROLE_ADMIN) > 0 ||
                    balanceOf(account, TOKEN_ROLE_ADMIN + 1000 * permissionSetId) > 0,
                TOKEN_ROLE_ADMIN
            );
        }

        if (roleId == TOKEN_ROLE_IS_WHITELISTED) {
            return (
                balanceOf(account, TOKEN_ROLE_WHITELIST_ADMIN) > 0 ||
                    balanceOf(account, TOKEN_ROLE_WHITELIST_ADMIN + 1000 * permissionSetId) > 0,
                TOKEN_ROLE_WHITELIST_ADMIN
            );
        }

        if (roleId == TOKEN_ROLE_IS_BLACKLISTED) {
            return (
                balanceOf(account, TOKEN_ROLE_BLACKLIST_ADMIN) > 0 ||
                    balanceOf(account, TOKEN_ROLE_BLACKLIST_ADMIN + 1000 * permissionSetId) > 0,
                TOKEN_ROLE_BLACKLIST_ADMIN
            );
        }

        return (false, 0);
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
                    revert(ERROR_TOKEN_ALREADY_EXISTS);
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
        revert(ERROR_TRANSFER_IS_NOT_ALLOWED);
    }
}
