import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621"; // Holder of tokens for impersonation

    // Impersonate account with tokens
    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountUSDC = ethers.parseUnits("1000", 6); // USDC is 6 decimals
    const amountDAI = ethers.parseUnits("1000", 18); // DAI is 18 decimals

    // Get USDC and DAI contract instances
    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    // Approve router to spend USDC and DAI
    await USDC_Contract.approve(ROUTER_ADDRESS, amountUSDC);
    await DAI_Contract.approve(ROUTER_ADDRESS, amountDAI);

    // Add liquidity
    const deadline = Math.floor(Date.now() / 1000) + (60 * 10); // 10 minute deadline
    const tx = await ROUTER.addLiquidity(
        USDC,
        DAI,
        amountUSDC, // Amount of USDC to add
        amountDAI, // Amount of DAI to add
        0, // Min USDC to add (slippage tolerance)
        0, // Min DAI to add (slippage tolerance)
        impersonatedSigner.address, // Address to receive the liquidity tokens
        deadline // Deadline
    );

    // Wait for the transaction to be confirmed
    await tx.wait();

    console.log("Liquidity added successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
