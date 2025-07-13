# **EDU LEGACY – Secure Your Digital & Educational Wealth**  

## **Overview 🚀**  
Losing access to private keys, seed phrases, and digital assets is a nightmare—you lose everything forever. But what if you had a **trustless, automated** solution to securely **pass down your assets, educational funds, and intellectual property** to your loved ones or future scholars?  

**EDU LEGACY** is a **decentralized smart will solution** built on the **secure and scalable EDU Chain**. Our **Smart Will system** leverages blockchain technology to **automate, protect, and securely execute asset distribution** based on predefined conditions, ensuring that your **scholarships, research, and educational wealth are never lost**.  

---  
## **Key Features ✨**  

### **📜 Dual Will System**  
- **Normal Wills** – Single-beneficiary inheritance with a **custom inactivity lock** (default 10 years, adjustable for testing).  
- **Milestone Wills** – Multi-phase distributions with **education-based triggers** (e.g., graduation, course completion, research milestone).  

### **🎓 Education & Scholarship Protection**  
- **Secure funding for students** through programmable **trust-based releases**.  
- **Automated scholarship management** – Institutions can allocate **blockchain-verified grants** with **automatic disbursement**.  
- **Learning resource inheritance** – Ensure **valuable educational assets (certificates, research, NFTs)** are safely transferred.  

### **⏰ Custom Time-Based Automation**  
- **Adjustable activity check** (default 10 years, but custom time allowed for testnet).  
- **1-year withdrawal cooldown** for secure claims.  
- **Milestone-specific release schedules** based on academic progress or predefined conditions.  

### **🔒 Security & Trustless Execution**  
- **Immutable Beneficiary Assignments** – Once set, cannot be altered.  
- **Anti-Frontrunning Protection** – Prevents unauthorized claims.  
- **Signature-Based Claim Verification** – Ensures only authorized beneficiaries receive assets.  
- **Fund Locking** – Assets securely held in contract until conditions are met.  

---  
## **Smart Contract Deployment** 🏗️  

- **EDU Chain Testnet Contract**: [0x82d5125995ad54d9ff7f856f4a2d2273b00d8b61](https://edu-chain-testnet.blockscout.com/address/0x82d5125995ad54d9ff7f856f4a2d2273b00d8b61)
- **Chain**: **EDU Chain Testnet**  

---  
## **Developer Integration 🧐**  

### **Installation**  
```bash  
npm install @openzeppelin/contracts ethers  
```  

### **Claiming as a Beneficiary**  
Here’s a function that allows beneficiaries to check their claimable wills:  
```solidity  
function getNormalWillAsBeneficiary(address _beneficiary) external view returns (address[] memory owners, uint256[] memory amounts) {  
    uint256 count = 0;  
    for (uint256 i = 0; i < willOwners.length; i++) {  
        address user = willOwners[i];  
        if (hasNormalWill[user] && normalWills[user].beneficiary == _beneficiary && !normalWills[user].isClaimed) {  
            count++;  
        }  
    }  
    owners = new address[](count);  
    amounts = new uint256[](count);  
    uint256 index = 0;  
    for (uint256 i = 0; i < willOwners.length; i++) {  
        address user = willOwners[i];  
        if (hasNormalWill[user] && normalWills[user].beneficiary == _beneficiary && !normalWills[user].isClaimed) {  
            owners[index] = user;  
            amounts[index] = normalWills[user].amount;  
            index++;  
        }  
    }  
    return (owners, amounts);  
}  
```  

---  
## **User Flow Diagram 📊**  
```mermaid  
graph TD  
    A[User Creates Will] --> B{Normal or Milestone?}  
    B -->|Normal| C[Lock EDU with Beneficiary]  
    B -->|Milestone| D[Configure Release Schedule]  
    C --> E[Ping System Every 10 Years (Custom Time Allowed)]  
    D --> F[Automatic Time-Based Releases]  
    E --> G[Beneficiary Claims After Inactivity]  
    F --> H[Gradual Asset Distribution]  
```  

---  
## **Security Architecture 🛡️**  

1. **Fund Locking** – Assets held in contract until conditions are met.  
2. **Temporal Validation** –  
   - **Custom inactivity lock** (default 10 years, but customizable for testing).  
   - **Time-based milestone releases** (graduation, course completion, research progress).  
   - **1-year withdrawal cooldown**.  
3. **Identity Verification** –  
   - **Beneficiary ≠ Owner** (ensuring trustless execution).  
   - **Claimant signature validation**.  
4. **Financial Safeguards** –  
   - **Percentage-based releases** (≤100%) to prevent overclaims.  
   - **Anti-overclaim protection**.  
   - **Platform fee deduction on will creation**.  

---  
## **Maintenance Operations 🔄**  
- **Withdraw Funds (After 1 Year)**  
- **Update Beneficiary**  
- **Reset Activity Timer**  

---  
## **Future Enhancements 🌍**  
- **Cross-Chain Support** – Expanding EDU LEGACY beyond **EDU Chain**.  
- **NFT Deposits** – Secure **educational certificates, research papers, and digital assets**.  
- **Decentralized Scholarship Management** – Universities can **allocate and distribute grants** via smart contracts.  
- **Enhanced Block Explorer Integration** – Improving transparency via **EDU Chain’s block explorer**.  

---  
## **Contribution Guidelines 🤝**  
We welcome contributions! Please follow our workflow:  
1. **Fork repository**  
2. **Create feature branch** (`git checkout -b feature/AmazingFeature`)  
3. **Commit changes** (`git commit -m 'Add AmazingFeature'`)  
4. **Push to branch** (`git push origin feature/AmazingFeature`)  
5. **Open a Pull Request**  

---  
## **License 📝**  
MIT Licensed – See [LICENSE](https://opensource.org/licenses/MIT) for details.  

---  
## **Join the Future of Secure Educational Inheritance 🔗**  
EDU LEGACY isn’t just a tool—it’s a **movement to democratize inheritance planning, protect digital wealth, and safeguard educational assets for generations to come**.  

🚀 **Secure your legacy today – Built on EDU Chain Testnet!**

