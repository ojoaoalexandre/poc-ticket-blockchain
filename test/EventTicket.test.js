const { loadFixture } = require("@nomicfoundation/hardhat-toolbox-mocha-ethers/network-helpers");
const { expect } = require("chai");
const hre = require("hardhat");

describe("EventTicket", function() {
  // ============ FIXTURES ============
  
  /**
   * Deploy clean EventTicket contract
   */
  async function deployEventTicketFixture() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();
    
    const EventTicket = await hre.ethers.getContractFactory("EventTicket");
    const eventTicket = await EventTicket.deploy();
    
    return { eventTicket, owner, addr1, addr2 };
  }
  
  /**
   * Deploy EventTicket contract with one ticket already minted
   */
  async function deployWithTicketFixture() {
    const { eventTicket, owner, addr1, addr2 } = await loadFixture(deployEventTicketFixture);
    
    const futureDate = Math.floor(Date.now() / 1000) + 86400; // +1 day
    await eventTicket.mintTicket(
      addr1.address,
      1, // eventId
      "A35",
      "VIP",
      futureDate,
      "ipfs://QmTest123"
    );
    
    return { eventTicket, owner, addr1, addr2, tokenId: 1n, futureDate };
  }
  
  // ============ DEPLOYMENT TESTS ============
  
  describe("Deployment", function() {
    it("Should set the correct name and symbol", async function() {
      const { eventTicket } = await loadFixture(deployEventTicketFixture);
      expect(await eventTicket.name()).to.equal("EventTicket");
      expect(await eventTicket.symbol()).to.equal("EVTKT");
    });
    
    it("Should set the deployer as owner", async function() {
      const { eventTicket, owner } = await loadFixture(deployEventTicketFixture);
      expect(await eventTicket.owner()).to.equal(owner.address);
    });
    
    it("Should start with tokenId counter at 1", async function() {
      const { eventTicket, addr1 } = await loadFixture(deployEventTicketFixture);
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      
      await eventTicket.mintTicket(addr1.address, 1, "A1", "VIP", futureDate, "ipfs://test");
      expect(await eventTicket.ownerOf(1)).to.equal(addr1.address);
    });
  });
  
  // ============ MINTING TESTS ============
  
  describe("Minting", function() {
    describe("Success cases", function() {
      it("Should mint a ticket successfully", async function() {
        const { eventTicket, addr1 } = await loadFixture(deployEventTicketFixture);
        const futureDate = Math.floor(Date.now() / 1000) + 86400;
        
        await expect(
          eventTicket.mintTicket(addr1.address, 1, "A35", "VIP", futureDate, "ipfs://QmTest")
        ).to.emit(eventTicket, "TicketMinted")
          .withArgs(1n, addr1.address, 1n, "A35", futureDate);
      });
      
      it("Should set correct owner after minting", async function() {
        const { eventTicket, tokenId, addr1 } = await loadFixture(deployWithTicketFixture);
        expect(await eventTicket.ownerOf(tokenId)).to.equal(addr1.address);
      });
      
      it("Should set correct tokenURI", async function() {
        const { eventTicket, tokenId } = await loadFixture(deployWithTicketFixture);
        expect(await eventTicket.tokenURI(tokenId)).to.equal("ipfs://QmTest123");
      });
      
      it("Should increment tokenId for multiple mints", async function() {
        const { eventTicket, addr1, addr2 } = await loadFixture(deployEventTicketFixture);
        const futureDate = Math.floor(Date.now() / 1000) + 86400;
        
        await eventTicket.mintTicket(addr1.address, 1, "A1", "VIP", futureDate, "ipfs://1");
        await eventTicket.mintTicket(addr2.address, 1, "A2", "VIP", futureDate, "ipfs://2");
        
        expect(await eventTicket.ownerOf(1)).to.equal(addr1.address);
        expect(await eventTicket.ownerOf(2)).to.equal(addr2.address);
      });
      
      it("Should return correct tokenId", async function() {
        const { eventTicket, addr1 } = await loadFixture(deployEventTicketFixture);
        const futureDate = Math.floor(Date.now() / 1000) + 86400;
        
        const tx = await eventTicket.mintTicket(addr1.address, 1, "A1", "VIP", futureDate, "ipfs://test");
        const receipt = await tx.wait();
        const event = receipt.logs.find(log => {
          try {
            return eventTicket.interface.parseLog(log).name === "TicketMinted";
          } catch {
            return false;
          }
        });
        const parsedEvent = eventTicket.interface.parseLog(event);
        expect(parsedEvent.args.tokenId).to.equal(1n);
      });
    });
    
    describe("Validation failures", function() {
      it("Should revert if recipient is zero address", async function() {
        const { eventTicket } = await loadFixture(deployEventTicketFixture);
        const futureDate = Math.floor(Date.now() / 1000) + 86400;
        
        await expect(
          eventTicket.mintTicket(hre.ethers.ZeroAddress, 1, "A1", "VIP", futureDate, "ipfs://test")
        ).to.be.revertedWith("Recipient cannot be zero address");
      });
      
      it("Should revert if tokenURI is empty", async function() {
        const { eventTicket, addr1 } = await loadFixture(deployEventTicketFixture);
        const futureDate = Math.floor(Date.now() / 1000) + 86400;
        
        await expect(
          eventTicket.mintTicket(addr1.address, 1, "A1", "VIP", futureDate, "")
        ).to.be.revertedWith("Token URI cannot be empty");
      });
      
      it("Should revert if seat is empty", async function() {
        const { eventTicket, addr1 } = await loadFixture(deployEventTicketFixture);
        const futureDate = Math.floor(Date.now() / 1000) + 86400;
        
        await expect(
          eventTicket.mintTicket(addr1.address, 1, "", "VIP", futureDate, "ipfs://test")
        ).to.be.revertedWith("Seat cannot be empty");
      });
      
      it("Should revert if event date is in the past", async function() {
        const { eventTicket, addr1 } = await loadFixture(deployEventTicketFixture);
        const pastDate = Math.floor(Date.now() / 1000) - 86400;
        
        await expect(
          eventTicket.mintTicket(addr1.address, 1, "A1", "VIP", pastDate, "ipfs://test")
        ).to.be.revertedWith("Event date must be in the future");
      });
      
      it("Should revert if caller is not owner", async function() {
        const { eventTicket, addr1 } = await loadFixture(deployEventTicketFixture);
        const futureDate = Math.floor(Date.now() / 1000) + 86400;
        
        await expect(
          eventTicket.connect(addr1).mintTicket(addr1.address, 1, "A1", "VIP", futureDate, "ipfs://test")
        ).to.be.revertedWithCustomError(eventTicket, "OwnableUnauthorizedAccount");
      });
    });
  });
  
  // ============ VIEW FUNCTIONS TESTS ============
  
  describe("View Functions", function() {
    describe("getTicketInfo", function() {
      it("Should return correct ticket information", async function() {
        const { eventTicket, tokenId, futureDate } = await loadFixture(deployWithTicketFixture);
        
        const ticket = await eventTicket.getTicketInfo(tokenId);
        expect(ticket.eventId).to.equal(1n);
        expect(ticket.seat).to.equal("A35");
        expect(ticket.sector).to.equal("VIP");
        expect(ticket.eventDate).to.equal(futureDate);
        expect(ticket.checkedIn).to.equal(false);
      });
      
      it("Should revert for non-existent ticket", async function() {
        const { eventTicket } = await loadFixture(deployEventTicketFixture);
        
        await expect(
          eventTicket.getTicketInfo(999)
        ).to.be.revertedWith("Ticket does not exist");
      });
    });
    
    describe("getCompleteTicketInfo", function() {
      it("Should return ticket data, URI and owner", async function() {
        const { eventTicket, tokenId, addr1, futureDate } = await loadFixture(deployWithTicketFixture);
        
        const [ticket, uri, owner] = await eventTicket.getCompleteTicketInfo(tokenId);
        
        expect(ticket.eventId).to.equal(1n);
        expect(ticket.seat).to.equal("A35");
        expect(ticket.sector).to.equal("VIP");
        expect(ticket.eventDate).to.equal(futureDate);
        expect(ticket.checkedIn).to.equal(false);
        expect(uri).to.equal("ipfs://QmTest123");
        expect(owner).to.equal(addr1.address);
      });
      
      it("Should revert for non-existent ticket", async function() {
        const { eventTicket } = await loadFixture(deployEventTicketFixture);
        
        await expect(
          eventTicket.getCompleteTicketInfo(999)
        ).to.be.revertedWith("Ticket does not exist");
      });
    });
    
    describe("isTicketValid", function() {
      it("Should return true for valid ticket", async function() {
        const { eventTicket, tokenId } = await loadFixture(deployWithTicketFixture);
        expect(await eventTicket.isTicketValid(tokenId)).to.equal(true);
      });
      
      it("Should return false for non-existent ticket", async function() {
        const { eventTicket } = await loadFixture(deployEventTicketFixture);
        expect(await eventTicket.isTicketValid(999)).to.equal(false);
      });
      
      it("Should return false for expired ticket", async function() {
        const { eventTicket, addr1 } = await loadFixture(deployEventTicketFixture);
        const pastDate = Math.floor(Date.now() / 1000) + 1; // 1 second in future
        
        await eventTicket.mintTicket(addr1.address, 1, "A1", "VIP", pastDate, "ipfs://test");
        
        // Advance time
        await hre.network.provider.send("evm_increaseTime", [2]);
        await hre.network.provider.send("evm_mine");
        
        expect(await eventTicket.isTicketValid(1)).to.equal(false);
      });
    });
    
    describe("isTicketCheckedIn", function() {
      it("Should return false for new ticket", async function() {
        const { eventTicket, tokenId } = await loadFixture(deployWithTicketFixture);
        expect(await eventTicket.isTicketCheckedIn(tokenId)).to.equal(false);
      });
      
      it("Should return true after check-in", async function() {
        const { eventTicket, tokenId } = await loadFixture(deployWithTicketFixture);
        
        await eventTicket.checkIn(tokenId);
        expect(await eventTicket.isTicketCheckedIn(tokenId)).to.equal(true);
      });
      
      it("Should revert for non-existent ticket", async function() {
        const { eventTicket } = await loadFixture(deployEventTicketFixture);
        await expect(
          eventTicket.isTicketCheckedIn(999)
        ).to.be.revertedWith("Ticket does not exist");
      });
    });
  });
  
  // ============ CHECK-IN TESTS ============
  
  describe("Check-in", function() {
    describe("Success cases", function() {
      it("Should check-in ticket successfully", async function() {
        const { eventTicket, tokenId } = await loadFixture(deployWithTicketFixture);
        
        await expect(eventTicket.checkIn(tokenId))
          .to.emit(eventTicket, "TicketCheckedIn");
      });
      
      it("Should mark ticket as checked in", async function() {
        const { eventTicket, tokenId } = await loadFixture(deployWithTicketFixture);
        
        await eventTicket.checkIn(tokenId);
        expect(await eventTicket.isTicketCheckedIn(tokenId)).to.equal(true);
        
        const ticket = await eventTicket.getTicketInfo(tokenId);
        expect(ticket.checkedIn).to.equal(true);
      });
    });
    
    describe("Validation failures", function() {
      it("Should revert if ticket does not exist", async function() {
        const { eventTicket } = await loadFixture(deployEventTicketFixture);
        
        await expect(eventTicket.checkIn(999))
          .to.be.revertedWith("Ticket does not exist");
      });
      
      it("Should revert if already checked in", async function() {
        const { eventTicket, tokenId } = await loadFixture(deployWithTicketFixture);
        
        await eventTicket.checkIn(tokenId);
        
        await expect(eventTicket.checkIn(tokenId))
          .to.be.revertedWith("Ticket already checked in");
      });
      
      it("Should revert if event has passed", async function() {
        const { eventTicket, addr1 } = await loadFixture(deployEventTicketFixture);
        const nearFuture = Math.floor(Date.now() / 1000) + 2;
        
        await eventTicket.mintTicket(addr1.address, 1, "A1", "VIP", nearFuture, "ipfs://test");
        
        // Advance time beyond event
        await hre.network.provider.send("evm_increaseTime", [10]);
        await hre.network.provider.send("evm_mine");
        
        await expect(eventTicket.checkIn(1))
          .to.be.revertedWith("Event has already passed");
      });
      
      it("Should revert if caller is not owner", async function() {
        const { eventTicket, tokenId, addr1 } = await loadFixture(deployWithTicketFixture);
        
        await expect(eventTicket.connect(addr1).checkIn(tokenId))
          .to.be.revertedWithCustomError(eventTicket, "OwnableUnauthorizedAccount");
      });
    });
  });
  
  // ============ TRANSFER TESTS ============
  
  describe("Transfers", function() {
    it("Should transfer ticket ownership", async function() {
      const { eventTicket, tokenId, addr1, addr2 } = await loadFixture(deployWithTicketFixture);
      
      await eventTicket.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);
      
      expect(await eventTicket.ownerOf(tokenId)).to.equal(addr2.address);
    });
    
    it("Should keep ticket data after transfer", async function() {
      const { eventTicket, tokenId, addr1, addr2, futureDate } = await loadFixture(deployWithTicketFixture);
      
      await eventTicket.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);
      
      const ticket = await eventTicket.getTicketInfo(tokenId);
      expect(ticket.eventId).to.equal(1n);
      expect(ticket.seat).to.equal("A35");
      expect(ticket.sector).to.equal("VIP");
      expect(ticket.eventDate).to.equal(futureDate);
      expect(ticket.checkedIn).to.equal(false);
    });
    
    it("Should revert if caller is not owner or approved", async function() {
      const { eventTicket, tokenId, addr1, addr2 } = await loadFixture(deployWithTicketFixture);
      
      await expect(
        eventTicket.connect(addr2).transferFrom(addr1.address, addr2.address, tokenId)
      ).to.be.revertedWithCustomError(eventTicket, "ERC721InsufficientApproval");
    });
  });
  
  // ============ EDGE CASES TESTS ============
  
  describe("Edge Cases", function() {
    it("Should handle multiple tickets for same event", async function() {
      const { eventTicket, addr1, addr2 } = await loadFixture(deployEventTicketFixture);
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      
      await eventTicket.mintTicket(addr1.address, 1, "A1", "VIP", futureDate, "ipfs://1");
      await eventTicket.mintTicket(addr2.address, 1, "A2", "VIP", futureDate, "ipfs://2");
      
      const ticket1 = await eventTicket.getTicketInfo(1);
      const ticket2 = await eventTicket.getTicketInfo(2);
      
      expect(ticket1.eventId).to.equal(ticket2.eventId);
      expect(ticket1.seat).to.not.equal(ticket2.seat);
    });
    
    it("Should allow check-in after transfer", async function() {
      const { eventTicket, tokenId, addr1, addr2 } = await loadFixture(deployWithTicketFixture);
      
      await eventTicket.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);
      await eventTicket.checkIn(tokenId);
      
      expect(await eventTicket.isTicketCheckedIn(tokenId)).to.equal(true);
      expect(await eventTicket.ownerOf(tokenId)).to.equal(addr2.address);
    });
    
    it("Should support ERC721 interface", async function() {
      const { eventTicket } = await loadFixture(deployEventTicketFixture);
      
      // ERC721 interface ID: 0x80ac58cd
      expect(await eventTicket.supportsInterface("0x80ac58cd")).to.equal(true);
    });
    
    it("Should support ERC721Metadata interface", async function() {
      const { eventTicket } = await loadFixture(deployEventTicketFixture);
      
      // ERC721Metadata interface ID: 0x5b5e139f
      expect(await eventTicket.supportsInterface("0x5b5e139f")).to.equal(true);
    });
  });
});

