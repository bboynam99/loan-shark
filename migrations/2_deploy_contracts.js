const LoanShark = artifacts.require('./LoanShark.sol');
const SimpleNft = artifacts.require('./SimpleNft.sol');
const MockDAI = artifacts.require('./MockDAI.sol');
const Sablier = artifacts.require('./Sablier.sol');

module.exports = async function (deployer, network, accounts) {
    // Deploy simple NFT
    await deployer.deploy(SimpleNft);
    const simpleNft = await SimpleNft.deployed();

    // Deploy fake DAI
    await deployer.deploy(MockDAI);
    const mockDAI = await MockDAI.deployed();

    const lender = accounts[0];
    const borrower = accounts[0];

    const lotsOfCash = "10000000000000000000000000"; // lots of dollar!
    const deposit =    "36000000000000000"; // almost 0.036 - but not quite

    // Give the first 3 accounts 10k in fake DAI
    await mockDAI.mint(accounts[0], lotsOfCash);
    await mockDAI.mint(accounts[0], lotsOfCash);

    // Deploy Sablier
    await deployer.deploy(Sablier);
    const sablier = await Sablier.deployed();

    const DAI = mockDAI.address;
    await deployer.deploy(LoanShark, simpleNft.address, DAI, sablier.address);

    const loanShark = await LoanShark.deployed();

    // KO
    await simpleNft.mintWithTokenURI(lender, 1, 'https://ipfs.infura.io/ipfs/QmX4HaxFopmnyaxXLXwAUvFJqC5AyTnYiMqkZ2RWK2tt5S', {from: lender});
    // Kaiju
    await simpleNft.mintWithTokenURI(lender, 2, 'https://ipfs.infura.io/ipfs/QmP2cwq9muuTtzTKFuBN6xRRygVdfy2p124urPn1dQ8C9w', {from: lender});
    // Nifty
    await simpleNft.mintWithTokenURI(lender, 3, 'https://niftyfootball.cards/api/network/1/token/2741', {from: lender});

    // Enable approval for all for the loan shark address
    await simpleNft.setApprovalForAll(loanShark.address, true);

    const periodInSecs = 3600;

    const now = Math.round(new Date().getTime() / 1000); // get seconds since unix epoch
    const startTime = now + 60; // 1 min from now
    const stopTime = now + periodInSecs + 60; // 30 days and 1 min from now

    // first three tokens are put for loan
    await loanShark.enableTokenForLending(1, periodInSecs, deposit, {from: lender});
    await loanShark.enableTokenForLending(2, periodInSecs, deposit, {from: lender});
    await loanShark.enableTokenForLending(3, periodInSecs, deposit, {from: lender});

    // Next three tokens are minted to but not put on loan so we can defo that flow

    // KO
    await simpleNft.mintWithTokenURI(lender, 4, 'https://ipfs.infura.io/ipfs/QmUs7wJiN43pS13Dx82WTqPe8krRJfhfXgMCfNaD4RxWob', {from: lender});
    // BlockCities
    await simpleNft.mintWithTokenURI(lender, 5, 'https://us-central1-block-cities.cloudfunctions.net/api/network/1/token/2066', {from: lender});
    // Axie infinity
    await simpleNft.mintWithTokenURI(lender, 6, 'https://axieinfinity.com/api/axies/14514', {from: lender});

    // set up one borrow
    mockDAI.approve(loanShark.address, lotsOfCash, {from: borrower});

    await loanShark.borrowToken(1, {from: borrower});
};
