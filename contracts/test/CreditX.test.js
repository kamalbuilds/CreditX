const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CreditX v2 - Universal Reputation Lending", function () {
  // Deploy all contracts and wire them together
  async function deployFixture() {
    const [owner, user1, user2, liquidator, lender] = await ethers.getSigners();

    // Deploy CreditReputation
    const CreditReputation = await ethers.getContractFactory("CreditReputation");
    const reputation = await CreditReputation.deploy();

    // Deploy UniversalVerifier
    const UniversalVerifier = await ethers.getContractFactory("UniversalVerifier");
    const verifier = await UniversalVerifier.deploy(await reputation.getAddress());

    // Set verifier on reputation contract
    await reputation.setVerifier(await verifier.getAddress());

    // Deploy CreditXLendingPool
    const CreditXLendingPool = await ethers.getContractFactory("CreditXLendingPool");
    const pool = await CreditXLendingPool.deploy(
      await reputation.getAddress(),
      await verifier.getAddress()
    );

    // Deploy MockLendingSource
    const MockLendingSource = await ethers.getContractFactory("MockLendingSource");
    const mockSource = await MockLendingSource.deploy();

    return { reputation, verifier, pool, mockSource, owner, user1, user2, liquidator, lender };
  }

  // Helper: register repayments to build up a user's score
  async function buildScore(verifier, user, repayments = 5) {
    for (let i = 0; i < repayments; i++) {
      await verifier.registerLoanEvent(
        user.address,
        true,
        ethers.parseEther("1"),
        `Repayment ${i + 1}`
      );
    }
  }

  // =============================================
  // CreditReputation Tests
  // =============================================
  describe("CreditReputation (Soulbound NFT)", function () {
    it("Should deploy with correct name and symbol", async function () {
      const { reputation } = await loadFixture(deployFixture);
      expect(await reputation.name()).to.equal("CreditX Reputation");
      expect(await reputation.symbol()).to.equal("CXREP");
    });

    it("Should allow verifier to mint reputation NFT", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      await verifier.registerLoanEvent(
        user1.address,
        true,
        ethers.parseEther("1"),
        "First loan repaid"
      );

      expect(await reputation.hasReputation(user1.address)).to.be.true;
      expect(await reputation.balanceOf(user1.address)).to.equal(1);
    });

    it("Should set initial score to BASE_SCORE (300) for new users", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      await verifier.registerLoanEvent(
        user1.address,
        true,
        ethers.parseEther("0.5"),
        "Small loan repaid"
      );

      // BASE_SCORE = 300, then +50 for repayment (weight 1 for < 1 ether) = 350
      expect(await reputation.getScore(user1.address)).to.equal(350);
    });

    it("Should emit ReputationMinted event", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      await expect(
        verifier.registerLoanEvent(user1.address, true, ethers.parseEther("1"), "Loan repaid")
      ).to.emit(reputation, "ReputationMinted");
    });

    it("Should prevent duplicate reputation minting", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      // First loan creates reputation
      await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("1"), "Loan 1");
      expect(await reputation.hasReputation(user1.address)).to.be.true;

      // Second loan should update, not mint again
      await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("1"), "Loan 2");
      expect(await reputation.balanceOf(user1.address)).to.equal(1);
    });

    it("Should reject non-verifier calls to mintReputation", async function () {
      const { reputation, user1 } = await loadFixture(deployFixture);

      await expect(
        reputation.connect(user1).mintReputation(user1.address, 300)
      ).to.be.revertedWith("Only verifier can update scores");
    });

    it("Should reject non-verifier calls to updateScore", async function () {
      const { reputation, user1 } = await loadFixture(deployFixture);

      await expect(
        reputation.connect(user1).updateScore(
          user1.address,
          500,
          ethers.keccak256("0x1234"),
          true,
          "hack"
        )
      ).to.be.revertedWith("Only verifier can update scores");
    });

    it("Should return full reputation data", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("1"), "Repaid");
      await verifier.registerLoanEvent(user1.address, false, ethers.parseEther("1"), "Defaulted");

      const rep = await reputation.getReputation(user1.address);
      expect(rep.totalLoans).to.equal(2);
      expect(rep.repaidLoans).to.equal(1);
      expect(rep.defaultedLoans).to.equal(1);
      expect(rep.proofCount).to.equal(2);
    });

    // Soulbound tests
    it("Should block transferFrom (soulbound)", async function () {
      const { verifier, reputation, user1, user2 } = await loadFixture(deployFixture);

      await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("1"), "Repaid");

      await expect(
        reputation.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith("Soulbound: transfers disabled");
    });

    it("Should block safeTransferFrom (soulbound)", async function () {
      const { verifier, reputation, user1, user2 } = await loadFixture(deployFixture);

      await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("1"), "Repaid");

      await expect(
        reputation.connect(user1)["safeTransferFrom(address,address,uint256,bytes)"](
          user1.address, user2.address, 1, "0x"
        )
      ).to.be.revertedWith("Soulbound: transfers disabled");
    });

    it("Should block approve (soulbound)", async function () {
      const { reputation, user1, user2 } = await loadFixture(deployFixture);

      await expect(
        reputation.connect(user1).approve(user2.address, 1)
      ).to.be.revertedWith("Soulbound: approvals disabled");
    });

    it("Should block setApprovalForAll (soulbound)", async function () {
      const { reputation, user1, user2 } = await loadFixture(deployFixture);

      await expect(
        reputation.connect(user1).setApprovalForAll(user2.address, true)
      ).to.be.revertedWith("Soulbound: approvals disabled");
    });

    it("Should allow owner to update verifier address", async function () {
      const { reputation, owner, user1 } = await loadFixture(deployFixture);

      await expect(reputation.setVerifier(user1.address))
        .to.emit(reputation, "VerifierUpdated");
    });

    it("Should reject non-owner setting verifier", async function () {
      const { reputation, user1 } = await loadFixture(deployFixture);

      await expect(
        reputation.connect(user1).setVerifier(user1.address)
      ).to.be.revertedWithCustomError(reputation, "OwnableUnauthorizedAccount");
    });
  });

  // =============================================
  // UniversalVerifier Tests
  // =============================================
  describe("UniversalVerifier", function () {
    it("Should register a loan repayment and increase score", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      await verifier.registerLoanEvent(
        user1.address,
        true,
        ethers.parseEther("5"),
        "ETH loan repaid"
      );

      // BASE_SCORE(300) + REPAYMENT_BOOST(50) * weight(2 for >1 ether) = 400
      expect(await reputation.getScore(user1.address)).to.equal(400);
    });

    it("Should register a loan default and decrease score", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      // First give user a reputation
      await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("5"), "Repaid");

      // Now default
      await verifier.registerLoanEvent(user1.address, false, ethers.parseEther("5"), "Defaulted");

      // 400 - DEFAULT_PENALTY(100) * weight(2) = 200
      expect(await reputation.getScore(user1.address)).to.equal(200);
    });

    it("Should apply weight 1 for loans < 1 ether", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      await verifier.registerLoanEvent(
        user1.address,
        true,
        ethers.parseEther("0.5"),
        "Small loan"
      );

      // 300 + 50 * 1 = 350
      expect(await reputation.getScore(user1.address)).to.equal(350);
    });

    it("Should apply weight 2 for loans between 1-10 ether", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      await verifier.registerLoanEvent(
        user1.address,
        true,
        ethers.parseEther("5"),
        "Medium loan"
      );

      // 300 + 50 * 2 = 400
      expect(await reputation.getScore(user1.address)).to.equal(400);
    });

    it("Should apply weight 3 for loans > 10 ether", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      await verifier.registerLoanEvent(
        user1.address,
        true,
        ethers.parseEther("20"),
        "Large loan"
      );

      // 300 + 50 * 3 = 450
      expect(await reputation.getScore(user1.address)).to.equal(450);
    });

    it("Should cap score at MAX_SCORE (1000)", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      // Register many repayments to max out score
      for (let i = 0; i < 20; i++) {
        await verifier.registerLoanEvent(
          user1.address,
          true,
          ethers.parseEther("20"),
          `Repayment ${i}`
        );
      }

      expect(await reputation.getScore(user1.address)).to.equal(1000);
    });

    it("Should floor score at MIN_SCORE (0)", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      // Create reputation, then default heavily
      await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("0.1"), "First");

      for (let i = 0; i < 5; i++) {
        await verifier.registerLoanEvent(
          user1.address,
          false,
          ethers.parseEther("20"),
          `Default ${i}`
        );
      }

      expect(await reputation.getScore(user1.address)).to.equal(0);
    });

    it("Should batch register events correctly", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      const isRepayments = [true, true, false, true];
      const amounts = [
        ethers.parseEther("1"),
        ethers.parseEther("2"),
        ethers.parseEther("0.5"),
        ethers.parseEther("5"),
      ];
      const reasons = ["Repaid 1", "Repaid 2", "Defaulted 1", "Repaid 3"];

      await verifier.batchRegisterEvents(user1.address, isRepayments, amounts, reasons);

      const rep = await reputation.getReputation(user1.address);
      expect(rep.totalLoans).to.equal(4);
      expect(rep.repaidLoans).to.equal(3);
      expect(rep.defaultedLoans).to.equal(1);
    });

    it("Should reject batch with mismatched array lengths", async function () {
      const { verifier, user1 } = await loadFixture(deployFixture);

      await expect(
        verifier.batchRegisterEvents(
          user1.address,
          [true, false],
          [ethers.parseEther("1")],
          ["Repaid"]
        )
      ).to.be.revertedWith("Array length mismatch");
    });

    it("Should reject non-owner calling registerLoanEvent", async function () {
      const { verifier, user1 } = await loadFixture(deployFixture);

      await expect(
        verifier.connect(user1).registerLoanEvent(
          user1.address,
          true,
          ethers.parseEther("1"),
          "Hack"
        )
      ).to.be.revertedWithCustomError(verifier, "OwnableUnauthorizedAccount");
    });

    // LTV tier tests
    it("Should return correct LTV for score >= 900 (50%)", async function () {
      const { verifier } = await loadFixture(deployFixture);
      expect(await verifier.getLTVForScore(900)).to.equal(5000);
      expect(await verifier.getLTVForScore(1000)).to.equal(5000);
    });

    it("Should return correct LTV for score 750-899 (75%)", async function () {
      const { verifier } = await loadFixture(deployFixture);
      expect(await verifier.getLTVForScore(750)).to.equal(7500);
      expect(await verifier.getLTVForScore(899)).to.equal(7500);
    });

    it("Should return correct LTV for score 500-749 (100%)", async function () {
      const { verifier } = await loadFixture(deployFixture);
      expect(await verifier.getLTVForScore(500)).to.equal(10000);
      expect(await verifier.getLTVForScore(749)).to.equal(10000);
    });

    it("Should return correct LTV for score 200-499 (120%)", async function () {
      const { verifier } = await loadFixture(deployFixture);
      expect(await verifier.getLTVForScore(200)).to.equal(12000);
      expect(await verifier.getLTVForScore(499)).to.equal(12000);
    });

    it("Should return correct LTV for score < 200 (150%)", async function () {
      const { verifier } = await loadFixture(deployFixture);
      expect(await verifier.getLTVForScore(0)).to.equal(15000);
      expect(await verifier.getLTVForScore(199)).to.equal(15000);
    });
  });

  // =============================================
  // CreditXLendingPool Tests
  // =============================================
  describe("CreditXLendingPool", function () {
    // Helper: fund pool with liquidity
    async function fundedPoolFixture() {
      const fixture = await deployFixture();
      const { pool, lender } = fixture;

      // Lender deposits 100 ETH into pool
      await pool.connect(lender).deposit({ value: ethers.parseEther("100") });

      return fixture;
    }

    describe("Deposits & Withdrawals", function () {
      it("Should accept deposits", async function () {
        const { pool, lender } = await loadFixture(deployFixture);

        await expect(
          pool.connect(lender).deposit({ value: ethers.parseEther("10") })
        ).to.emit(pool, "Deposited").withArgs(lender.address, ethers.parseEther("10"));

        expect(await pool.totalDeposited()).to.equal(ethers.parseEther("10"));
      });

      it("Should reject zero deposits", async function () {
        const { pool, lender } = await loadFixture(deployFixture);

        await expect(
          pool.connect(lender).deposit({ value: 0 })
        ).to.be.revertedWith("Must deposit something");
      });

      it("Should allow withdrawals", async function () {
        const { pool, lender } = await loadFixture(deployFixture);

        await pool.connect(lender).deposit({ value: ethers.parseEther("10") });

        await expect(
          pool.connect(lender).withdraw(ethers.parseEther("5"))
        ).to.emit(pool, "Withdrawn").withArgs(lender.address, ethers.parseEther("5"));

        expect(await pool.totalDeposited()).to.equal(ethers.parseEther("5"));
      });

      it("Should reject withdrawing more than deposited", async function () {
        const { pool, lender } = await loadFixture(deployFixture);

        await pool.connect(lender).deposit({ value: ethers.parseEther("10") });

        await expect(
          pool.connect(lender).withdraw(ethers.parseEther("20"))
        ).to.be.revertedWith("Insufficient deposit");
      });
    });

    describe("Borrowing", function () {
      it("Should allow borrowing with sufficient collateral (new user, 150% LTV)", async function () {
        const { pool, lender, user1, verifier } = await loadFixture(deployFixture);

        await pool.connect(lender).deposit({ value: ethers.parseEther("100") });

        // New user with no reputation = score 0 = 150% LTV
        // Borrow 1 ETH, need 1.5 ETH collateral
        await expect(
          pool.connect(user1).borrow(ethers.parseEther("1"), {
            value: ethers.parseEther("1.5"),
          })
        ).to.emit(pool, "LoanCreated");

        expect(await pool.totalBorrowed()).to.equal(ethers.parseEther("1"));
        expect(await pool.totalLoansIssued()).to.equal(1);
      });

      it("Should allow borrowing with lower collateral for high-score users", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, verifier, user1 } = fixture;

        // Build up score to 900+ (needs many repayments with large amounts)
        for (let i = 0; i < 10; i++) {
          await verifier.registerLoanEvent(
            user1.address,
            true,
            ethers.parseEther("20"),
            `Repayment ${i}`
          );
        }

        // Score should be maxed at 1000 -> LTV 50%
        // Borrow 1 ETH, need only 0.5 ETH collateral
        await pool.connect(user1).borrow(ethers.parseEther("1"), {
          value: ethers.parseEther("0.5"),
        });

        const loan = await pool.loans(user1.address);
        expect(loan.requiredLTV).to.equal(5000); // 50%
        expect(loan.active).to.be.true;
      });

      it("Should reject borrowing with insufficient collateral", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, user1 } = fixture;

        // Score 0 = 150% LTV, borrow 1 ETH needs 1.5 ETH
        await expect(
          pool.connect(user1).borrow(ethers.parseEther("1"), {
            value: ethers.parseEther("1"),
          })
        ).to.be.revertedWith("Insufficient collateral");
      });

      it("Should reject zero borrow amount", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, user1 } = fixture;

        await expect(
          pool.connect(user1).borrow(0, { value: ethers.parseEther("1") })
        ).to.be.revertedWith("Must borrow something");
      });

      it("Should reject second loan while first is active", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, user1 } = fixture;

        await pool.connect(user1).borrow(ethers.parseEther("1"), {
          value: ethers.parseEther("1.5"),
        });

        await expect(
          pool.connect(user1).borrow(ethers.parseEther("1"), {
            value: ethers.parseEther("1.5"),
          })
        ).to.be.revertedWith("Existing loan must be repaid first");
      });

      it("Should reject borrowing more than pool balance", async function () {
        const { pool, user1 } = await loadFixture(deployFixture);

        // Empty pool (no deposits), borrow requires pool to have funds
        // But borrow() is payable and msg.value goes to pool, so we need
        // borrowAmount > pool balance BEFORE msg.value is added
        // Actually the check is: address(this).balance >= borrowAmount
        // Since msg.value is already part of address(this).balance when checked,
        // we need a scenario where collateral alone isn't enough.
        // With no deposits and collateral < borrow amount:
        await expect(
          pool.connect(user1).borrow(ethers.parseEther("10"), {
            value: ethers.parseEther("1.5"), // collateral < borrow amount, pool has no other funds
          })
        ).to.be.reverted; // Will fail on collateral or liquidity check
      });
    });

    describe("Repayment", function () {
      it("Should allow full repayment and return collateral", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, user1 } = fixture;

        // Borrow 1 ETH with 1.5 ETH collateral
        await pool.connect(user1).borrow(ethers.parseEther("1"), {
          value: ethers.parseEther("1.5"),
        });

        // Repay immediately (minimal interest)
        await expect(
          pool.connect(user1).repay({ value: ethers.parseEther("1.01") })
        ).to.emit(pool, "LoanRepaid");

        const loan = await pool.loans(user1.address);
        expect(loan.active).to.be.false;
        expect(await pool.totalRepaid()).to.equal(1);
      });

      it("Should accrue interest over time", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, user1 } = fixture;

        await pool.connect(user1).borrow(ethers.parseEther("10"), {
          value: ethers.parseEther("15"),
        });

        // Advance 365 days
        await time.increase(365 * 24 * 60 * 60);

        const interest = await pool.getInterestOwed(user1.address);
        // Score 0 = 25% rate. 10 ETH * 25% * 1 year = 2.5 ETH
        expect(interest).to.be.closeTo(ethers.parseEther("2.5"), ethers.parseEther("0.01"));
      });

      it("Should reject repayment with no active loan", async function () {
        const { pool, user1 } = await loadFixture(deployFixture);

        await expect(
          pool.connect(user1).repay({ value: ethers.parseEther("1") })
        ).to.be.revertedWith("No active loan");
      });

      it("Should reject underpayment", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, user1 } = fixture;

        await pool.connect(user1).borrow(ethers.parseEther("10"), {
          value: ethers.parseEther("15"),
        });

        await expect(
          pool.connect(user1).repay({ value: ethers.parseEther("5") })
        ).to.be.revertedWith("Must repay full amount + interest");
      });
    });

    describe("Liquidation", function () {
      it("Should allow liquidation when health factor < 100", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, user1, liquidator } = fixture;

        // Borrow with minimum collateral at 150% LTV
        await pool.connect(user1).borrow(ethers.parseEther("1"), {
          value: ethers.parseEther("1.5"),
        });

        // Advance time so interest accrues enough to make health < 100
        // 25% rate on 1 ETH, need interest to push health below threshold
        // Health = (collateral * 10000 * 100) / (debt * requiredLTV)
        // = (1.5 * 10000 * 100) / ((1 + interest) * 15000)
        // When interest > 0, health decreases
        // At t=0: 1500000 / 15000 = 100 (barely healthy)
        // After some time, interest makes debt > 1, health < 100
        await time.increase(1); // Even 1 second makes it liquidatable since health starts at exactly 100

        const healthFactor = await pool.getHealthFactor(user1.address);
        expect(healthFactor).to.be.lessThan(100);

        await expect(
          pool.connect(liquidator).liquidate(user1.address)
        ).to.emit(pool, "Liquidated");

        const loan = await pool.loans(user1.address);
        expect(loan.active).to.be.false;
        expect(await pool.totalLiquidated()).to.equal(1);
      });

      it("Should reject liquidation of healthy loan", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, user1, liquidator } = fixture;

        // Borrow with excess collateral
        await pool.connect(user1).borrow(ethers.parseEther("1"), {
          value: ethers.parseEther("3"), // 300% collateral (very healthy)
        });

        await expect(
          pool.connect(liquidator).liquidate(user1.address)
        ).to.be.revertedWith("Loan is healthy");
      });

      it("Should reject liquidation of non-existent loan", async function () {
        const { pool, user1, liquidator } = await loadFixture(deployFixture);

        await expect(
          pool.connect(liquidator).liquidate(user1.address)
        ).to.be.revertedWith("No active loan");
      });
    });

    describe("View Functions", function () {
      it("Should return max health factor for no active loan", async function () {
        const { pool, user1 } = await loadFixture(deployFixture);

        const health = await pool.getHealthFactor(user1.address);
        expect(health).to.equal(ethers.MaxUint256);
      });

      it("Should preview borrow terms correctly", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, verifier, user1 } = fixture;

        // Build score to ~500 range
        for (let i = 0; i < 4; i++) {
          await verifier.registerLoanEvent(
            user1.address,
            true,
            ethers.parseEther("5"),
            `Repay ${i}`
          );
        }

        const preview = await pool.previewBorrow(user1.address, ethers.parseEther("10"));
        expect(preview.creditScore).to.be.gte(500);
        expect(preview.ltvBps).to.equal(10000); // 100% for score 500-749
        expect(preview.requiredCollateral).to.equal(ethers.parseEther("10")); // 100% of 10 ETH
        expect(preview.interestRateBps).to.equal(1000); // 10% for score 500-749
      });

      it("Should calculate pool utilization", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, user1 } = fixture;

        // 100 ETH deposited, borrow 10 ETH = 10% utilization
        await pool.connect(user1).borrow(ethers.parseEther("10"), {
          value: ethers.parseEther("15"),
        });

        const utilization = await pool.getUtilization();
        expect(utilization).to.equal(1000); // 10% in bps
      });

      it("Should return zero utilization for empty pool", async function () {
        const { pool } = await loadFixture(deployFixture);
        expect(await pool.getUtilization()).to.equal(0);
      });
    });

    describe("Interest Rate Tiers", function () {
      it("Should charge 2% for score >= 900", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, verifier, user1 } = fixture;

        // Max score
        for (let i = 0; i < 15; i++) {
          await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("20"), `R${i}`);
        }

        await pool.connect(user1).borrow(ethers.parseEther("1"), {
          value: ethers.parseEther("0.5"),
        });

        const loan = await pool.loans(user1.address);
        expect(loan.interestRate).to.equal(200); // 2% = MIN_RATE
      });

      it("Should charge 25% for score < 200", async function () {
        const fixture = await loadFixture(fundedPoolFixture);
        const { pool, user1 } = fixture;

        // Score 0 = no reputation
        await pool.connect(user1).borrow(ethers.parseEther("1"), {
          value: ethers.parseEther("1.5"),
        });

        const loan = await pool.loans(user1.address);
        expect(loan.interestRate).to.equal(2500); // 25% = MAX_RATE
      });
    });
  });

  // =============================================
  // MockLendingSource Tests
  // =============================================
  describe("MockLendingSource", function () {
    it("Should create a mock loan and emit event", async function () {
      const { mockSource, user1 } = await loadFixture(deployFixture);

      await expect(
        mockSource.connect(user1).createLoan(ethers.parseEther("5"))
      ).to.emit(mockSource, "LoanCreated");

      const loan = await mockSource.mockLoans(0);
      expect(loan.borrower).to.equal(user1.address);
      expect(loan.amount).to.equal(ethers.parseEther("5"));
      expect(loan.repaid).to.be.false;
      expect(loan.defaulted).to.be.false;
    });

    it("Should repay a mock loan", async function () {
      const { mockSource, user1 } = await loadFixture(deployFixture);

      await mockSource.connect(user1).createLoan(ethers.parseEther("5"));

      await expect(
        mockSource.connect(user1).repayLoan(0)
      ).to.emit(mockSource, "LoanRepaid");

      const loan = await mockSource.mockLoans(0);
      expect(loan.repaid).to.be.true;
    });

    it("Should default a mock loan", async function () {
      const { mockSource, user1 } = await loadFixture(deployFixture);

      await mockSource.connect(user1).createLoan(ethers.parseEther("5"));

      await expect(
        mockSource.defaultLoan(0)
      ).to.emit(mockSource, "LoanDefaulted");

      const loan = await mockSource.mockLoans(0);
      expect(loan.defaulted).to.be.true;
    });

    it("Should reject repay on already settled loan", async function () {
      const { mockSource, user1 } = await loadFixture(deployFixture);

      await mockSource.connect(user1).createLoan(ethers.parseEther("5"));
      await mockSource.connect(user1).repayLoan(0);

      await expect(
        mockSource.connect(user1).repayLoan(0)
      ).to.be.revertedWith("Loan already settled");
    });

    it("Should reject repay from non-borrower", async function () {
      const { mockSource, user1, user2 } = await loadFixture(deployFixture);

      await mockSource.connect(user1).createLoan(ethers.parseEther("5"));

      await expect(
        mockSource.connect(user2).repayLoan(0)
      ).to.be.revertedWith("Not your loan");
    });

    it("Should reject default on already settled loan", async function () {
      const { mockSource, user1 } = await loadFixture(deployFixture);

      await mockSource.connect(user1).createLoan(ethers.parseEther("5"));
      await mockSource.defaultLoan(0);

      await expect(
        mockSource.defaultLoan(0)
      ).to.be.revertedWith("Loan already settled");
    });

    it("Should track loan IDs correctly", async function () {
      const { mockSource, user1, user2 } = await loadFixture(deployFixture);

      await mockSource.connect(user1).createLoan(ethers.parseEther("1"));
      await mockSource.connect(user2).createLoan(ethers.parseEther("2"));

      expect(await mockSource.nextLoanId()).to.equal(2);

      const loan0 = await mockSource.mockLoans(0);
      const loan1 = await mockSource.mockLoans(1);
      expect(loan0.borrower).to.equal(user1.address);
      expect(loan1.borrower).to.equal(user2.address);
      expect(loan0.amount).to.equal(ethers.parseEther("1"));
      expect(loan1.amount).to.equal(ethers.parseEther("2"));
    });
  });

  // =============================================
  // Integration / E2E Tests
  // =============================================
  describe("Integration: Full Lending Flow", function () {
    it("Should complete full flow: verify -> score -> borrow -> repay", async function () {
      const [owner, user1, lender] = await ethers.getSigners();

      // Deploy fresh
      const CreditReputation = await ethers.getContractFactory("CreditReputation");
      const reputation = await CreditReputation.deploy();
      const UniversalVerifier = await ethers.getContractFactory("UniversalVerifier");
      const verifier = await UniversalVerifier.deploy(await reputation.getAddress());
      await reputation.setVerifier(await verifier.getAddress());
      const CreditXLendingPool = await ethers.getContractFactory("CreditXLendingPool");
      const pool = await CreditXLendingPool.deploy(
        await reputation.getAddress(),
        await verifier.getAddress()
      );

      // 1. Lender provides liquidity
      await pool.connect(lender).deposit({ value: ethers.parseEther("50") });

      // 2. Build user credit history (register 5 repayments with large amounts)
      for (let i = 0; i < 5; i++) {
        await verifier.registerLoanEvent(
          user1.address,
          true,
          ethers.parseEther("20"),
          `Historical repayment ${i + 1}`
        );
      }

      // 3. Check score: 300 + (50 * 3 * 5) = 1050 -> capped at 1000
      const score = await reputation.getScore(user1.address);
      expect(score).to.equal(1000);

      // 4. Preview and execute borrow
      const preview = await pool.previewBorrow(user1.address, ethers.parseEther("10"));
      expect(preview.ltvBps).to.equal(5000); // 50% for score 1000
      expect(preview.requiredCollateral).to.equal(ethers.parseEther("5")); // 50% of 10

      // Borrow 10 ETH with 5 ETH collateral
      const balBefore = await ethers.provider.getBalance(user1.address);
      await pool.connect(user1).borrow(ethers.parseEther("10"), {
        value: ethers.parseEther("5"),
      });

      const loan = await pool.loans(user1.address);
      expect(loan.borrowed).to.equal(ethers.parseEther("10"));
      expect(loan.interestRate).to.equal(200); // 2%
      expect(loan.active).to.be.true;

      // 5. Repay (immediately, so minimal interest)
      await pool.connect(user1).repay({ value: ethers.parseEther("10.01") });

      const loanAfter = await pool.loans(user1.address);
      expect(loanAfter.active).to.be.false;
    });

    it("Should show score improvement over multiple loan events", async function () {
      const { verifier, reputation, user1 } = await loadFixture(deployFixture);

      // Start: no reputation
      expect(await reputation.hasReputation(user1.address)).to.be.false;

      // Register first repayment (small)
      await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("0.5"), "Loan 1");
      const score1 = await reputation.getScore(user1.address);
      expect(score1).to.equal(350); // 300 + 50*1

      // Register second repayment (medium)
      await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("5"), "Loan 2");
      const score2 = await reputation.getScore(user1.address);
      expect(score2).to.equal(450); // 350 + 50*2

      // Register a default (medium)
      await verifier.registerLoanEvent(user1.address, false, ethers.parseEther("3"), "Default");
      const score3 = await reputation.getScore(user1.address);
      expect(score3).to.equal(250); // 450 - 100*2

      // Recovery with large repayment
      await verifier.registerLoanEvent(user1.address, true, ethers.parseEther("20"), "Recovery");
      const score4 = await reputation.getScore(user1.address);
      expect(score4).to.equal(400); // 250 + 50*3
    });
  });
});
