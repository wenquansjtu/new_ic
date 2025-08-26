# 🤖 Intelligent Contract - LLM-Powered Smart Contract Generator

A sophisticated Web3 application that uses Large Language Models (GPT-4/Claude) to generate production-ready smart contracts based on natural language requirements. Built with Vercel Functions for seamless deployment.

## 🌟 Features

### 🎯 Core Capabilities
- **AI-Powered Generation**: Uses OpenAI GPT-4 or Anthropic Claude for intelligent contract creation
- **Serverless Architecture**: Built with Vercel Functions - no separate backend needed
- **Multi-Contract Support**: ERC-20, ERC-721, MultiSig, DeFi, DAO, and custom contracts
- **Web3 Authentication**: Secure MetaMask integration with challenge-response authentication
- **Real-time Generation**: Streaming responses with loading states and progress indicators
- **Production-Ready Code**: Generated contracts follow OpenZeppelin standards and best practices

### 🛡️ Security & Quality
- **Security-First**: Generated contracts include reentrancy guards, access controls, and proper validation
- **Gas Optimization**: AI-optimized code for minimal gas consumption
- **Rate Limiting**: Built-in protection against API abuse
- **Error Handling**: Robust error handling with detailed user feedback
- **CORS Security**: Proper cross-origin resource sharing configuration

## 🏗️ Architecture

This is a **frontend-only** application with **Vercel Functions** providing the API functionality:

```mermaid
graph TB
    subgraph \"Frontend (Vite)\"
        A[Web3 Auth] --> B[Contract Generator UI]
        B --> C[Code Display]
        C --> D[History Management]
    end
    
    subgraph \"Vercel Functions\"
        E[/api/generate] --> F[LLM Service]
        G[/api/health] --> H[Health Check]
        I[/api/types] --> J[Contract Types]
    end
    
    subgraph \"External Services\"
        K[OpenAI/Claude API]
        L[MetaMask Wallet]
        M[Moralis Auth]
    end
    
    B --> E
    F --> K
    A --> L
    A --> M
    
    style A fill:#f9f,stroke:#333
    style F fill:#bbf,stroke:#333
    style K fill:#dfd,stroke:#333
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key OR Anthropic API key
- MetaMask browser extension
- Vercel account (for deployment)

### 1. Clone and Setup
```bash
git clone https://github.com/your-repo/intelligent-contract.git
cd intelligent-contract
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# API configuration (uses relative paths for Vercel Functions)
VITE_BACKEND_API_URL=/api

# Web3 configuration
VITE_MORALIS_API_KEY=your-moralis-key
VITE_WEB3_DOMAIN=localhost
VITE_WEB3_URI=http://localhost:3000
VITE_WEB3_CHAIN_ID=1
```

### 4. Set Environment Variables for API Functions
Create a `.env.local` file for Vercel Functions:
```env
# LLM Provider Configuration
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7

# Alternative: Anthropic Configuration
# LLM_PROVIDER=anthropic
# ANTHROPIC_API_KEY=your-anthropic-key
```

### 5. Development
```bash
# Start development server with Vercel Functions
npm run dev
```

Visit http://localhost:3000 to access the application.

## 🌐 Deployment

### One-Click Deployment to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/intelligent-contract)

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# LLM_PROVIDER=openai
# OPENAI_API_KEY=your-production-openai-key
# VITE_MORALIS_API_KEY=your-production-moralis-key
```

## 📊 API Reference

### Generate Contract
```http
POST /api/generate
Content-Type: application/json

{
  \"requirements\": \"Create an ERC-20 token for a gaming platform\",
  \"contractType\": \"erc20\",
  \"options\": {
    \"tokenName\": \"GameToken\",
    \"tokenSymbol\": \"GAME\",
    \"initialSupply\": \"1000000\"
  }
}
```

### Health Check
```http
GET /api/health
```

### Get Contract Types
```http
GET /api/types
```

## 🎨 Supported Contract Types

| Contract Type | Description | Keywords |
|---------------|-------------|----------|
| **ERC-20** | Fungible tokens | token, erc20, coin, currency |
| **ERC-721** | Non-fungible tokens | nft, collectible, art, unique |
| **MultiSig** | Multi-signature wallets | multisig, wallet, governance |
| **Crowdfunding** | Fundraising contracts | crowdfunding, ico, investment |
| **DeFi** | DeFi protocols | defi, lending, staking, yield |
| **DAO** | Governance contracts | dao, governance, voting |
| **Custom** | Tailored solutions | custom, specific, bespoke |

## 🛠️ Project Structure

```
intelligent-contract/
├── api/                   # Vercel Functions
│   ├── generate.js        # Contract generation endpoint
│   ├── health.js          # Health check endpoint
│   └── types.js           # Contract types endpoint
├── src/                   # Frontend source
│   ├── js/                # JavaScript modules
│   ├── css/               # Stylesheets
│   ├── index.html         # Main page
│   └── profile.html       # Profile page
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel configuration
├── vite.config.js        # Vite configuration
└── .env.example          # Environment template
```

## 🔧 Configuration

### LLM Provider Configuration

#### OpenAI (Recommended)
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
```

#### Anthropic Claude
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4000
ANTHROPIC_TEMPERATURE=0.7
```

### Web3 Configuration
```env
VITE_WEB3_DOMAIN=your-domain.com
VITE_WEB3_URI=https://your-app.vercel.app
VITE_WEB3_CHAIN_ID=1
VITE_MORALIS_API_KEY=your-moralis-key
```

## 📈 Performance & Limits

### Vercel Functions Limits
- **Execution Time**: 30 seconds max per request
- **Memory**: 1024 MB
- **Rate Limiting**: 10 requests per IP per 15 minutes
- **Concurrent Executions**: 1000 (Pro plan)

### API Optimization
- Built-in rate limiting
- Request validation
- Error handling with retries
- Efficient token usage

## 🔒 Security Features

### API Security
- Rate limiting per IP address
- Input validation and sanitization
- CORS protection
- Environment variable protection

### Generated Contract Security
- OpenZeppelin standard compliance
- Reentrancy protection
- Access control implementation
- Input validation in contracts
- Gas optimization patterns

## 🧪 Testing

### Local Testing
```bash
# Test API functions locally
npm run dev

# Test contract generation
curl -X POST http://localhost:3000/api/generate \\
  -H \"Content-Type: application/json\" \\
  -d '{\"requirements\": \"Create a simple ERC-20 token\"}'
```

### Production Testing
```bash
# Test deployed API
curl -X POST https://your-app.vercel.app/api/health

curl -X POST https://your-app.vercel.app/api/generate \\
  -H \"Content-Type: application/json\" \\
  -d '{\"requirements\": \"Create an NFT contract\"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Check environment variables in Vercel dashboard
   - Ensure correct API key format
   - Verify API key permissions

2. **Rate Limiting**
   - Wait 15 minutes before retrying
   - Use different IP address if needed
   - Contact support for rate limit increases

3. **Generation Timeout**
   - Simplify requirements
   - Try again with shorter input
   - Check API provider status

4. **CORS Errors**
   - Verify domain configuration
   - Check Vercel deployment settings
   - Ensure proper API paths

## 📚 Resources

### Documentation
- [Vercel Functions Documentation](https://vercel.com/docs/concepts/functions/serverless-functions)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/)

### Examples

#### Simple Token Generation
```javascript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requirements: 'Create a utility token for my app with 1M supply',
    contractType: 'erc20',
    options: {
      tokenName: 'UtilityToken',
      tokenSymbol: 'UTIL',
      initialSupply: '1000000'
    }
  })
});
```

#### NFT Collection
```javascript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requirements: 'Create an NFT collection for digital art with royalties',
    contractType: 'erc721'
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vercel** for excellent serverless platform
- **OpenZeppelin** for secure smart contract standards
- **OpenAI** for powerful language model capabilities
- **Anthropic** for Claude AI integration
- **MetaMask** for Web3 wallet integration
- **Moralis** for Web3 authentication infrastructure

---

**Built with ❤️ for the Web3 Developer Community**

*Empowering developers to create secure, efficient smart contracts through the power of AI and serverless architecture*