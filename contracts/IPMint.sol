// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IPMint is ERC721, Ownable {
    uint256 public tokenCounter;

    mapping(bytes32 => bool) public hashExists;
    mapping(bytes32 => uint256) public hashToTokenId;
    mapping(uint256 => bytes32) public tokenHash;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256) public tokenTimestamp;

    event IPMinted(
        address indexed owner,
        uint256 indexed tokenId,
        bytes32 indexed ipHash,
        string tokenURI,
        uint256 timestamp
    );

    constructor() ERC721("IP Mint", "IPM") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    function mintIP(bytes32 ipHash, string memory metadataURI)
        public returns (uint256)
    {
        require(!hashExists[ipHash], "IP already minted");
        uint256 tokenId = tokenCounter;
        _safeMint(msg.sender, tokenId);
        hashExists[ipHash] = true;
        hashToTokenId[ipHash] = tokenId;
        tokenHash[tokenId] = ipHash;
        _tokenURIs[tokenId] = metadataURI;
        tokenTimestamp[tokenId] = block.timestamp;
        emit IPMinted(msg.sender, tokenId, ipHash, metadataURI, block.timestamp);
        tokenCounter += 1;
        return tokenId;
    }

    function tokenURI(uint256 tokenId)
        public view override returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return _tokenURIs[tokenId];
    }

    function verifyIP(bytes32 ipHash)
        public view returns (bool exists, uint256 tokenId, uint256 timestamp)
    {
        tokenId = hashToTokenId[ipHash];
        exists = hashExists[ipHash];
        timestamp = exists ? tokenTimestamp[tokenId] : 0;
    }

    function getTokenInfo(uint256 tokenId)
        public view returns (
            address owner,
            bytes32 ipHash,
            string memory uri,
            uint256 timestamp
        )
    {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        owner = ownerOf(tokenId);
        ipHash = tokenHash[tokenId];
        uri = _tokenURIs[tokenId];
        timestamp = tokenTimestamp[tokenId];
    }
}
