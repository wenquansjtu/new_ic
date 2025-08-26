// Vercel Function for LLM-powered contract generation
const axios = require('axios');

// Rate limiting state (in-memory, resets on function restart)
const rateLimitMap = new Map();

// Helper function for rate limiting
function checkRateLimit(ip, limit = 10, window = 15 * 60 * 1000) { // 10 requests per 15 minutes
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < window);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return true;
}

// Contract template service
class ContractTemplateService {
  constructor() {
    this.contractTypes = {
      erc20: {
        keywords: ['token', 'erc20', 'coin', 'currency', 'payment', 'fungible'],
        name: 'ERC-20 Token Contract'
      },
      erc721: {
        keywords: ['nft', 'collectible', 'art', 'unique', 'non-fungible', 'erc721'],
        name: 'ERC-721 NFT Contract'
      },
      multisig: {
        keywords: ['multisig', 'multi-signature', 'wallet', 'governance', 'voting'],
        name: 'Multi-Signature Wallet'
      },
      crowdfunding: {
        keywords: ['crowdfunding', 'fundraising', 'ico', 'investment', 'raise'],
        name: 'Crowdfunding Contract'
      },
      defi: {
        keywords: ['defi', 'lending', 'staking', 'yield', 'liquidity', 'farming'],
        name: 'DeFi Protocol Contract'
      },
      governance: {
        keywords: ['dao', 'governance', 'voting', 'proposal', 'democracy'],
        name: 'DAO Governance Contract'
      },
      custom: {
        keywords: ['custom', 'specific', 'tailored', 'bespoke'],
        name: 'Custom Smart Contract'
      }
    };
  }

  detectContractType(requirements) {
    const text = requirements.toLowerCase();
    
    for (const [type, config] of Object.entries(this.contractTypes)) {
      for (const keyword of config.keywords) {
        if (text.includes(keyword)) {
          return type;
        }
      }
    }
    
    return 'custom';
  }

  getSystemPrompt(contractType) {
    const basePrompt = `You are an expert Solidity smart contract developer with deep knowledge of blockchain security, gas optimization, and best practices. Your task is to generate production-ready smart contracts based on user requirements.

REQUIREMENTS:
- Use Solidity ^0.8.19 or later
- Follow OpenZeppelin standards when applicable
- Include comprehensive natspec documentation
- Implement proper security measures (reentrancy guards, access controls, etc.)
- Optimize for gas efficiency
- Include proper error handling with custom errors
- Use events for important state changes
- Follow the Checks-Effects-Interactions pattern

SECURITY CONSIDERATIONS:
- Always validate inputs
- Use SafeMath patterns (though not required in 0.8+)
- Implement proper access controls
- Consider potential attack vectors
- Use reentrancy guards where needed

OUTPUT FORMAT:
- Return ONLY the Solidity contract code
- Start with SPDX license identifier
- Include pragma statement
- Add comprehensive comments and documentation
- No explanatory text before or after the code`;

    const typeSpecificPrompt = this.getTypeSpecificPrompt(contractType);
    
    return `${basePrompt}\n\n${typeSpecificPrompt}`;
  }

  getTypeSpecificPrompt(contractType) {
    const prompts = {
      erc20: `SPECIFIC REQUIREMENTS FOR ERC-20 TOKEN:
- Implement full ERC-20 interface
- Include mint/burn functionality if needed
- Add owner controls for token management
- Consider implementing pausable functionality
- Include proper decimals handling`,

      erc721: `SPECIFIC REQUIREMENTS FOR ERC-721 NFT:
- Implement full ERC-721 interface with metadata extension
- Include proper tokenURI functionality
- Add minting controls and supply limits
- Consider royalty standards (ERC-2981) if applicable
- Include batch operations for gas efficiency`,

      multisig: `SPECIFIC REQUIREMENTS FOR MULTISIG WALLET:
- Implement multi-signature transaction approval system
- Include owner management functionality
- Add transaction proposal and execution system
- Implement proper threshold controls
- Include emergency recovery mechanisms`,

      crowdfunding: `SPECIFIC REQUIREMENTS FOR CROWDFUNDING:
- Implement funding goals and deadlines
- Add refund mechanisms for failed campaigns
- Include contributor tracking and rewards
- Add fund withdrawal controls for campaign owners
- Consider milestone-based funding release`,

      defi: `SPECIFIC REQUIREMENTS FOR DEFI PROTOCOL:
- Implement secure token handling and transfers
- Add proper price oracle integration considerations
- Include yield calculation mechanisms
- Implement emergency pause functionality
- Add proper liquidity management controls`,

      governance: `SPECIFIC REQUIREMENTS FOR DAO GOVERNANCE:
- Implement proposal creation and voting mechanisms
- Add vote delegation functionality
- Include timelock controls for execution
- Add quorum and threshold management
- Consider vote weight calculation methods`,

      custom: `SPECIFIC REQUIREMENTS FOR CUSTOM CONTRACT:
- Analyze the requirements carefully to determine the best implementation approach
- Follow established patterns from similar contract types
- Implement all necessary functionality as specified
- Ensure the contract is secure and gas-efficient`
    };

    return prompts[contractType] || prompts.custom;
  }

  generateUserPrompt(requirements, contractType, options = {}) {
    let prompt = `Please generate a ${this.contractTypes[contractType]?.name || 'smart contract'} based on the following requirements:\n\n`;
    
    prompt += `REQUIREMENTS:\n${requirements}\n\n`;
    
    if (options.tokenName) {
      prompt += `TOKEN NAME: ${options.tokenName}\n`;
    }
    
    if (options.tokenSymbol) {
      prompt += `TOKEN SYMBOL: ${options.tokenSymbol}\n`;
    }
    
    if (options.initialSupply) {
      prompt += `INITIAL SUPPLY: ${options.initialSupply}\n`;
    }
    
    if (options.additionalFeatures && options.additionalFeatures.length > 0) {
      prompt += `ADDITIONAL FEATURES: ${options.additionalFeatures.join(', ')}\n`;
    }
    
    prompt += `\nPlease ensure the contract is secure, well-documented, and follows best practices. Generate only the Solidity code without any additional explanations.`;
    
    return prompt;
  }

  validateAndCleanContract(contractCode) {
    if (!contractCode || typeof contractCode !== 'string') {
      throw new Error('Invalid contract code received from LLM');
    }

    // Remove any markdown code blocks
    let cleaned = contractCode.replace(/```solidity\n?/g, '').replace(/```\n?/g, '');
    
    // Ensure it starts with SPDX license
    if (!cleaned.includes('SPDX-License-Identifier')) {
      cleaned = '// SPDX-License-Identifier: MIT\n' + cleaned;
    }
    
    // Ensure it has pragma
    if (!cleaned.includes('pragma solidity')) {
      const lines = cleaned.split('\n');
      const licenseIndex = lines.findIndex(line => line.includes('SPDX-License-Identifier'));
      if (licenseIndex !== -1) {
        lines.splice(licenseIndex + 1, 0, 'pragma solidity ^0.8.19;');
        cleaned = lines.join('\n');
      }
    }

    // Basic validation
    if (!cleaned.includes('contract ') && !cleaned.includes('interface ') && !cleaned.includes('library ')) {
      throw new Error('Generated code does not contain a valid Solidity contract');
    }

    // Remove excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    
    return cleaned;
  }
}

// LLM Service
class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openai';
    this.maxRetries = 3;
    this.timeout = 30000; // 30 seconds
  }

  async generateContract(systemPrompt, userPrompt, options = {}) {
    const maxTokens = options.maxTokens || parseInt(process.env.OPENAI_MAX_TOKENS) || 4000;
    const temperature = options.temperature || parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🤖 Attempting contract generation (attempt ${attempt}/${this.maxRetries})`);
        
        let result;
        if (this.provider === 'openai') {
          result = await this.callOpenAI(systemPrompt, userPrompt, maxTokens, temperature);
        } else if (this.provider === 'anthropic') {
          result = await this.callAnthropic(systemPrompt, userPrompt, maxTokens, temperature);
        } else {
          throw new Error(`Unsupported LLM provider: ${this.provider}`);
        }

        console.log(`✅ Contract generated successfully on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.maxRetries) {
          throw new Error(`LLM generation failed after ${this.maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
  }

  async callOpenAI(systemPrompt, userPrompt, maxTokens, temperature) {
    const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      }
    );

    if (!response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    return response.data.choices[0].message.content;
  }

  async callAnthropic(systemPrompt, userPrompt, maxTokens, temperature) {
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: this.timeout
      }
    );

    if (!response.data.content || !response.data.content[0]) {
      throw new Error('Invalid response from Anthropic API');
    }

    return response.data.content[0].text;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main API handler
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        type: 'MethodNotAllowed'
      }
    });
  }

  try {
    // Rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests. Please try again later.',
          type: 'RateLimitExceeded'
        }
      });
    }

    // Validate request body
    const { requirements, contractType, options = {} } = req.body;

    if (!requirements || typeof requirements !== 'string' || requirements.length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Requirements must be at least 10 characters long',
          type: 'ValidationError'
        }
      });
    }

    if (requirements.length > 5000) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Requirements must not exceed 5000 characters',
          type: 'ValidationError'
        }
      });
    }

    console.log(`🔧 Generating contract of type: ${contractType || 'auto-detect'}`);
    console.log(`📝 Requirements: ${requirements.substring(0, 100)}...`);

    // Initialize services
    const llmService = new LLMService();
    const templateService = new ContractTemplateService();

    // Detect contract type if not provided
    const detectedType = contractType || templateService.detectContractType(requirements);
    
    // Get contract template prompt for the LLM
    const systemPrompt = templateService.getSystemPrompt(detectedType);
    const userPrompt = templateService.generateUserPrompt(requirements, detectedType, options);

    // Generate contract using LLM
    const generatedContract = await llmService.generateContract(
      systemPrompt,
      userPrompt,
      options
    );

    // Validate and clean the generated contract
    const cleanedContract = templateService.validateAndCleanContract(generatedContract);

    // Prepare response
    const response = {
      success: true,
      data: {
        contract: cleanedContract,
        contractType: detectedType,
        metadata: {
          generatedAt: new Date().toISOString(),
          llmProvider: process.env.LLM_PROVIDER,
          version: '1.0.0',
          requirements: requirements,
          options: options
        }
      }
    };

    console.log(`✅ Contract generated successfully (${cleanedContract.length} characters)`);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Contract generation error:', error);
    
    // Return detailed error information
    res.status(500).json({
      success: false,
      error: {
        message: 'Contract generation failed',
        details: error.message,
        type: error.name || 'GenerationError',
        timestamp: new Date().toISOString()
      }
    });
  }
}