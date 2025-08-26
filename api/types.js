// Vercel Function for getting supported contract types
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        type: 'MethodNotAllowed'
      }
    });
  }

  try {
    const contractTypes = [
      {
        type: 'erc20',
        name: 'ERC-20 Token',
        description: 'Standard fungible token contract',
        keywords: ['token', 'erc20', 'coin', 'currency', 'payment'],
        examples: [
          'Create a utility token for my gaming platform',
          'Generate an ERC-20 token with 1 million supply',
          'Build a payment token with burn functionality'
        ]
      },
      {
        type: 'erc721',
        name: 'ERC-721 NFT',
        description: 'Non-fungible token contract',
        keywords: ['nft', 'collectible', 'art', 'unique', 'non-fungible'],
        examples: [
          'Create an NFT collection for digital art',
          'Build a collectible card game NFT contract',
          'Generate an NFT contract with royalties'
        ]
      },
      {
        type: 'multisig',
        name: 'Multi-Signature Wallet',
        description: 'Multi-signature wallet contract',
        keywords: ['multisig', 'multi-signature', 'wallet', 'governance', 'voting'],
        examples: [
          'Create a 3-of-5 multisig wallet for team treasury',
          'Build a governance multisig with timelock',
          'Generate a secure wallet requiring multiple approvals'
        ]
      },
      {
        type: 'crowdfunding',
        name: 'Crowdfunding',
        description: 'Crowdfunding and fundraising contract',
        keywords: ['crowdfunding', 'fundraising', 'ico', 'investment'],
        examples: [
          'Create a crowdfunding contract for startup funding',
          'Build an ICO contract with token distribution',
          'Generate a fundraising contract with refunds'
        ]
      },
      {
        type: 'defi',
        name: 'DeFi Protocol',
        description: 'Decentralized finance protocol contract',
        keywords: ['defi', 'lending', 'staking', 'yield', 'liquidity'],
        examples: [
          'Create a staking contract with rewards',
          'Build a lending protocol with interest',
          'Generate a yield farming contract'
        ]
      },
      {
        type: 'governance',
        name: 'Governance',
        description: 'DAO governance contract',
        keywords: ['dao', 'governance', 'voting', 'proposal', 'democracy'],
        examples: [
          'Create a DAO governance contract with voting',
          'Build a proposal system with timelock',
          'Generate a democratic voting mechanism'
        ]
      },
      {
        type: 'custom',
        name: 'Custom Contract',
        description: 'Custom smart contract based on specific requirements',
        keywords: ['custom', 'specific', 'tailored', 'bespoke'],
        examples: [
          'Create a custom business logic contract',
          'Build a specific use case smart contract',
          'Generate a tailored solution for my needs'
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: contractTypes,
      total: contractTypes.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contract types error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch contract types',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}