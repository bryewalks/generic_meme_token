import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Signer, BigNumber } from 'ethers';
import { Token } from '../typechain/Token'

describe('GenericMeme contract', () => {
  let Token;
  let genericMemeToken: Token;
  let tokenName: string;
  let tokenSymbol: string;
  let tokenTotalSupply: BigNumber;
  let owner: Signer;
  let signer1: Signer;
  let signer2: Signer;
  let signers: Signer[];

  beforeEach(async () => {
    Token = await ethers.getContractFactory('Token');
    [owner, signer1, signer2, ...signers] = await ethers.getSigners();
    genericMemeToken = await Token.deploy();
    tokenName = await genericMemeToken.name()
    tokenSymbol = await genericMemeToken.symbol()
    tokenTotalSupply = await genericMemeToken.totalSupply()
  })

  describe('Deployment', () => {
    it ('should initialize with correct name, symbol, and supply', async () => {
      expect(tokenName).to.equal('Generic Meme Token');
      expect(tokenSymbol).to.equal('GMEME');
      expect(tokenTotalSupply).to.equal(1000000000000);
    })

    it('should set correct owner', async () => {
      const genericMemeOwner = await genericMemeToken.owner();
      const expectedAddress = await owner.getAddress();

      expect(genericMemeOwner).to.equal(expectedAddress);
    })

    it('should assign total supply to contract owner', async () => {
      const ownersAddress = await owner.getAddress();
      const ownersBalance = await genericMemeToken.balanceOf(ownersAddress)

      expect(ownersBalance).to.equal(tokenTotalSupply)
    })
  })

  describe('Transactions', () => {
    it('should transfer correct amount from one address to another', async () => {
      const address1 = await signer1.getAddress();
      const address2 = await signer2.getAddress();

      await genericMemeToken.transfer(address1, 50)

      expect(await genericMemeToken.balanceOf(address1)).to.equal(50)

      await genericMemeToken.connect(signer1).transfer(address2, 25)

      expect(await genericMemeToken.balanceOf(address1)).to.equal(25)
      expect(await genericMemeToken.balanceOf(address2)).to.equal(25)
    })

    it('should update owners balance', async () => {
      const ownersAddress = await owner.getAddress();
      const ownersInitialBalance = await genericMemeToken.balanceOf(ownersAddress)
      const address1 = await signer1.getAddress();
      const address2 = await signer2.getAddress();

      await genericMemeToken.transfer(address1, 500);
      await genericMemeToken.transfer(address2, 100);

      const ownersUpdatedBalance = await genericMemeToken.balanceOf(ownersAddress);

      expect(ownersUpdatedBalance).to.equal(ownersInitialBalance.sub(600));
      expect(await genericMemeToken.balanceOf(address1)).to.equal(500);
      expect(await genericMemeToken.balanceOf(address2)).to.equal(100);
    })

    it('should fail if sender has insufficent tokens', async () => {
      const ownersAddress = await owner.getAddress();
      const ownersInitialBalance = await genericMemeToken.balanceOf(ownersAddress)

      await expect(genericMemeToken.connect(signer1).transfer(ownersAddress, 5000)).to.be.revertedWith('Not enough tokens');

      expect(await genericMemeToken.balanceOf(ownersAddress)).to.equal(ownersInitialBalance);
    })
  })
})
