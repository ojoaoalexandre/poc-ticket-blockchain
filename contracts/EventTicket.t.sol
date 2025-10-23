// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventTicket.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract EventTicketTest is IERC721Receiver {
    EventTicket public eventTicket;
    address public owner;
    address public addr1;
    address public addr2;
    
    function setUp() public {
        owner = address(this);
        addr1 = address(0x1);
        addr2 = address(0x2);
        eventTicket = new EventTicket();
    }
    
    function testDeploymentName() public view {
        string memory name = eventTicket.name();
        require(
            keccak256(abi.encodePacked(name)) == keccak256(abi.encodePacked("EventTicket")),
            "Name should be EventTicket"
        );
    }
    
    function testDeploymentSymbol() public view {
        string memory symbol = eventTicket.symbol();
        require(
            keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("EVTKT")),
            "Symbol should be EVTKT"
        );
    }
    
    function testDeploymentOwner() public view {
        address contractOwner = eventTicket.owner();
        require(contractOwner == owner, "Owner should be deployer");
    }
    
    function testMintTicketSuccess() public {
        uint256 futureDate = block.timestamp + 1 days;
        
        uint256 tokenId = eventTicket.mintTicket(
            addr1,
            1,
            "A35",
            "VIP",
            futureDate,
            "ipfs://QmTest123"
        );
        
        require(tokenId == 1, "First token ID should be 1");
        require(eventTicket.ownerOf(tokenId) == addr1, "Owner should be addr1");
    }
    
    function testMintTicketSetsCorrectData() public {
        uint256 futureDate = block.timestamp + 1 days;
        
        uint256 tokenId = eventTicket.mintTicket(
            addr1,
            1,
            "A35",
            "VIP",
            futureDate,
            "ipfs://QmTest123"
        );
        
        EventTicket.Ticket memory ticket = eventTicket.getTicketInfo(tokenId);
        require(ticket.eventId == 1, "Event ID should be 1");
        require(
            keccak256(abi.encodePacked(ticket.seat)) == keccak256(abi.encodePacked("A35")),
            "Seat should be A35"
        );
        require(
            keccak256(abi.encodePacked(ticket.sector)) == keccak256(abi.encodePacked("VIP")),
            "Sector should be VIP"
        );
        require(ticket.eventDate == futureDate, "Event date should match");
        require(ticket.checkedIn == false, "Should not be checked in");
    }
    
    function testMintTicketIncrementsTokenId() public {
        uint256 futureDate = block.timestamp + 1 days;
        
        uint256 tokenId1 = eventTicket.mintTicket(addr1, 1, "A1", "VIP", futureDate, "ipfs://1");
        uint256 tokenId2 = eventTicket.mintTicket(addr2, 1, "A2", "VIP", futureDate, "ipfs://2");
        
        require(tokenId1 == 1, "First token ID should be 1");
        require(tokenId2 == 2, "Second token ID should be 2");
        require(eventTicket.ownerOf(tokenId1) == addr1, "Owner of token 1 should be addr1");
        require(eventTicket.ownerOf(tokenId2) == addr2, "Owner of token 2 should be addr2");
    }
    
    function testMintTicketRevertsOnZeroAddress() public {
        uint256 futureDate = block.timestamp + 1 days;
        
        try eventTicket.mintTicket(address(0), 1, "A1", "VIP", futureDate, "ipfs://test") {
            revert("Should have reverted");
        } catch Error(string memory reason) {
            require(
                keccak256(abi.encodePacked(reason)) == 
                keccak256(abi.encodePacked("Recipient cannot be zero address")),
                "Should revert with correct message"
            );
        }
    }
    
    function testMintTicketRevertsOnEmptyURI() public {
        uint256 futureDate = block.timestamp + 1 days;
        
        try eventTicket.mintTicket(addr1, 1, "A1", "VIP", futureDate, "") {
            revert("Should have reverted");
        } catch Error(string memory reason) {
            require(
                keccak256(abi.encodePacked(reason)) == 
                keccak256(abi.encodePacked("Token URI cannot be empty")),
                "Should revert with correct message"
            );
        }
    }
    
    function testMintTicketRevertsOnEmptySeat() public {
        uint256 futureDate = block.timestamp + 1 days;
        
        try eventTicket.mintTicket(addr1, 1, "", "VIP", futureDate, "ipfs://test") {
            revert("Should have reverted");
        } catch Error(string memory reason) {
            require(
                keccak256(abi.encodePacked(reason)) == 
                keccak256(abi.encodePacked("Seat cannot be empty")),
                "Should revert with correct message"
            );
        }
    }
    
    function testMintTicketRevertsOnPastDate() public {
        uint256 pastDate = 0;
        
        try eventTicket.mintTicket(addr1, 1, "A1", "VIP", pastDate, "ipfs://test") {
            revert("Should have reverted");
        } catch Error(string memory reason) {
            require(
                keccak256(abi.encodePacked(reason)) == 
                keccak256(abi.encodePacked("Event date must be in the future")),
                "Should revert with correct message"
            );
        }
    }
    
    function testGetTicketInfoReturnsCorrectData() public {
        uint256 futureDate = block.timestamp + 1 days;
        uint256 tokenId = eventTicket.mintTicket(addr1, 1, "A35", "VIP", futureDate, "ipfs://test");
        
        EventTicket.Ticket memory ticket = eventTicket.getTicketInfo(tokenId);
        require(ticket.eventId == 1, "Event ID should match");
        require(ticket.eventDate == futureDate, "Event date should match");
        require(!ticket.checkedIn, "Should not be checked in initially");
    }
    
    function testGetCompleteTicketInfo() public {
        uint256 futureDate = block.timestamp + 1 days;
        uint256 tokenId = eventTicket.mintTicket(addr1, 1, "A35", "VIP", futureDate, "ipfs://test");
        
        (EventTicket.Ticket memory ticket, string memory uri, address ticketOwner) = 
            eventTicket.getCompleteTicketInfo(tokenId);
        
        require(ticket.eventId == 1, "Event ID should match");
        require(
            keccak256(abi.encodePacked(uri)) == keccak256(abi.encodePacked("ipfs://test")),
            "URI should match"
        );
        require(ticketOwner == addr1, "Owner should match");
    }
    
    function testIsTicketValidForValidTicket() public {
        uint256 futureDate = block.timestamp + 1 days;
        uint256 tokenId = eventTicket.mintTicket(addr1, 1, "A1", "VIP", futureDate, "ipfs://test");
        
        require(eventTicket.isTicketValid(tokenId), "Valid ticket should return true");
    }
    
    function testIsTicketValidForNonExistentTicket() public view {
        require(!eventTicket.isTicketValid(999), "Non-existent ticket should return false");
    }
    
    function testIsTicketCheckedInInitiallyFalse() public {
        uint256 futureDate = block.timestamp + 1 days;
        uint256 tokenId = eventTicket.mintTicket(addr1, 1, "A1", "VIP", futureDate, "ipfs://test");
        
        require(!eventTicket.isTicketCheckedIn(tokenId), "New ticket should not be checked in");
    }
    
    function testCheckInSuccess() public {
        uint256 futureDate = block.timestamp + 1 days;
        uint256 tokenId = eventTicket.mintTicket(addr1, 1, "A1", "VIP", futureDate, "ipfs://test");
        
        eventTicket.checkIn(tokenId);
        
        require(eventTicket.isTicketCheckedIn(tokenId), "Ticket should be checked in");
        
        EventTicket.Ticket memory ticket = eventTicket.getTicketInfo(tokenId);
        require(ticket.checkedIn, "Ticket checkedIn flag should be true");
    }
    
    function testCheckInRevertsOnNonExistentTicket() public {
        try eventTicket.checkIn(999) {
            revert("Should have reverted");
        } catch Error(string memory reason) {
            require(
                keccak256(abi.encodePacked(reason)) == 
                keccak256(abi.encodePacked("Ticket does not exist")),
                "Should revert with correct message"
            );
        }
    }
    
    function testCheckInRevertsOnDoubleCheckIn() public {
        uint256 futureDate = block.timestamp + 1 days;
        uint256 tokenId = eventTicket.mintTicket(addr1, 1, "A1", "VIP", futureDate, "ipfs://test");
        
        eventTicket.checkIn(tokenId);
        
        try eventTicket.checkIn(tokenId) {
            revert("Should have reverted");
        } catch Error(string memory reason) {
            require(
                keccak256(abi.encodePacked(reason)) == 
                keccak256(abi.encodePacked("Ticket already checked in")),
                "Should revert with correct message"
            );
        }
    }
    
    function testTransferTicket() public {
        uint256 futureDate = block.timestamp + 1 days;
        uint256 tokenId = eventTicket.mintTicket(address(this), 1, "A1", "VIP", futureDate, "ipfs://test");
        
        eventTicket.transferFrom(address(this), addr2, tokenId);
        
        require(eventTicket.ownerOf(tokenId) == addr2, "New owner should be addr2");
    }
    
    function testTransferKeepsTicketData() public {
        uint256 futureDate = block.timestamp + 1 days;
        uint256 tokenId = eventTicket.mintTicket(address(this), 1, "A35", "VIP", futureDate, "ipfs://test");
        
        eventTicket.transferFrom(address(this), addr2, tokenId);
        
        EventTicket.Ticket memory ticket = eventTicket.getTicketInfo(tokenId);
        require(ticket.eventId == 1, "Event ID should remain");
        require(
            keccak256(abi.encodePacked(ticket.seat)) == keccak256(abi.encodePacked("A35")),
            "Seat should remain"
        );
    }
    
    function testMultipleTicketsSameEvent() public {
        uint256 futureDate = block.timestamp + 1 days;
        
        uint256 tokenId1 = eventTicket.mintTicket(addr1, 1, "A1", "VIP", futureDate, "ipfs://1");
        uint256 tokenId2 = eventTicket.mintTicket(addr2, 1, "A2", "VIP", futureDate, "ipfs://2");
        
        EventTicket.Ticket memory ticket1 = eventTicket.getTicketInfo(tokenId1);
        EventTicket.Ticket memory ticket2 = eventTicket.getTicketInfo(tokenId2);
        
        require(ticket1.eventId == ticket2.eventId, "Both should have same event ID");
        require(
            keccak256(abi.encodePacked(ticket1.seat)) != keccak256(abi.encodePacked(ticket2.seat)),
            "Seats should be different"
        );
    }
    
    function testSupportsERC721Interface() public view {
        require(
            eventTicket.supportsInterface(0x80ac58cd),
            "Should support ERC721 interface"
        );
    }
    
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
