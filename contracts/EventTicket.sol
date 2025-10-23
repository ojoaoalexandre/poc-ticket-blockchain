// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicket is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Ticket {
        uint256 eventId;
        string seat;
        string sector;
        uint256 eventDate;
        bool checkedIn;
    }

    mapping(uint256 => Ticket) private _tickets;

    event TicketMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 indexed eventId,
        string seat,
        uint256 eventDate
    );

    event TicketCheckedIn(
        uint256 indexed tokenId,
        uint256 timestamp
    );

    constructor() ERC721("EventTicket", "EVTKT") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    function getTicketInfo(uint256 tokenId) public view returns (Ticket memory) {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        return _tickets[tokenId];
    }

    function getCompleteTicketInfo(uint256 tokenId) 
        public 
        view 
        returns (
            Ticket memory ticket,
            string memory uri,
            address owner
        ) 
    {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        return (
            _tickets[tokenId],
            tokenURI(tokenId),
            ownerOf(tokenId)
        );
    }

    function isTicketValid(uint256 tokenId) public view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) {
            return false;
        }
        return _tickets[tokenId].eventDate > block.timestamp;
    }

    function isTicketCheckedIn(uint256 tokenId) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        return _tickets[tokenId].checkedIn;
    }

    function mintTicket(
        address recipient,
        uint256 eventId,
        string memory seat,
        string memory sector,
        uint256 eventDate,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        require(recipient != address(0), "Recipient cannot be zero address");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        require(bytes(seat).length > 0, "Seat cannot be empty");
        require(eventDate > block.timestamp, "Event date must be in the future");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _tickets[tokenId] = Ticket({
            eventId: eventId,
            seat: seat,
            sector: sector,
            eventDate: eventDate,
            checkedIn: false
        });

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit TicketMinted(tokenId, recipient, eventId, seat, eventDate);
        return tokenId;
    }

    function checkIn(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        require(!_tickets[tokenId].checkedIn, "Ticket already checked in");
        require(_tickets[tokenId].eventDate >= block.timestamp, "Event has already passed");
        
        _tickets[tokenId].checkedIn = true;
        
        emit TicketCheckedIn(tokenId, block.timestamp);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
