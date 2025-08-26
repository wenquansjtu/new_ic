# Intelligent Contract Platform - Frontend

A modern Web3-enabled frontend application for generating smart contracts with MetaMask authentication.

## 🚀 Features

- **Web3 Authentication**: Secure login using MetaMask and Moralis
- **Smart Contract Generation**: AI-powered Solidity contract generation
- **Syntax Highlighting**: Beautiful code display with Prism.js
- **History Management**: Local storage of generated contracts
- **Responsive Design**: Works on desktop and mobile devices
- **Modern Frontend**: Built with Vite for fast development and builds

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Build Tool**: Vite
- **Web3**: Ethers.js v6
- **Authentication**: Moralis Web3 Auth API
- **Syntax Highlighting**: Prism.js
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── index.html          # Main application page
├── profile.html        # User profile page
├── css/
│   ├── style.css       # Main styles
│   └── prism.css       # Syntax highlighting styles
└── js/
    ├── main.js         # Main application logic
    ├── profile.js      # Profile page logic
    ├── web3Auth.js     # Web3 authentication module
    ├── utils.js        # Utility functions
    └── prism.js        # Syntax highlighting

public/
└── assets/
    └── img/            # Images and assets

dist/                   # Build output (generated)
```

## 🔧 Setup & Development

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Moralis account and API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```bash
   VITE_MORALIS_API_KEY=your-moralis-api-key-here
   VITE_WEB3_DOMAIN=your-domain.com
   VITE_WEB3_URI=https://your-domain.com/
   VITE_WEB3_CHAIN_ID=1
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🌐 Deployment to Vercel

### Automatic Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Frontend migration complete"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Environment Variables:**
   Set in Vercel dashboard → Settings → Environment Variables:
   - `VITE_MORALIS_API_KEY`
   - `VITE_WEB3_DOMAIN`
   - `VITE_WEB3_URI`
   - `VITE_WEB3_CHAIN_ID`

### Manual Deployment

```bash
npm run build
npx vercel --prod
```

## 🔐 Web3 Authentication Flow

1. **Connect MetaMask**: User clicks login button
2. **Request Message**: App requests challenge from Moralis
3. **Sign Message**: User signs challenge with MetaMask
4. **Verify Signature**: App verifies signature with Moralis
5. **Store Session**: Authentication data stored locally
6. **Access Control**: Protected features now available

## 🎯 Usage

### Basic Features

1. **Login**: Click "Login" button and approve MetaMask connection
2. **Generate Contract**: Enter requirements and click "Generate"
3. **Copy & Deploy**: Copy generated code to Remix IDE
4. **View History**: Browse previously generated contracts
5. **Profile**: View authentication details

### Advanced Features

- **Pagination**: Navigate through contract history
- **Syntax Highlighting**: Solidity code with proper formatting
- **Local Storage**: Contracts saved across browser sessions
- **Responsive Design**: Works on all device sizes

## 🔧 Configuration

### Moralis Setup

1. Create account at [moralis.io](https://moralis.io)
2. Get your API key from dashboard
3. Add to environment variables

### Network Configuration

- **Mainnet**: Chain ID `1` (default)
- **Goerli**: Chain ID `5`
- **Polygon**: Chain ID `137`
- **BSC**: Chain ID `56`

## 🚀 Performance

- **Fast Loading**: Vite-optimized builds
- **Code Splitting**: Automatic module bundling
- **Caching**: Efficient asset caching
- **CDN**: Vercel global CDN distribution

## 🛡️ Security

- **Environment Variables**: Sensitive data in env vars
- **CSP Headers**: Content Security Policy
- **XSS Protection**: Built-in protections
- **HTTPS Only**: Secure connections required

## 📝 API Integration

### Contract Generation API

```javascript
const response = await fetch(API_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ question: userInput })
});
```

### Moralis Authentication API

```javascript
// Request challenge
POST https://authapi.moralis.io/challenge/request/evm

// Verify signature  
POST https://authapi.moralis.io/challenge/verify/evm
```

## 🎨 Customization

### Styling

- Edit `src/css/style.css` for main styles
- Customize colors, fonts, and layouts
- Responsive breakpoints included

### Features

- Add new contract templates
- Integrate additional APIs
- Extend authentication options

## 🐛 Troubleshooting

### Common Issues

1. **MetaMask not detected**:
   - Ensure MetaMask extension is installed
   - Check browser compatibility

2. **Authentication fails**:
   - Verify Moralis API key
   - Check network configuration

3. **Build errors**:
   - Clear `node_modules` and reinstall
   - Update Node.js version

### Debug Mode

Set `DEBUG=true` in environment for detailed logging.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

- **Documentation**: [Project Wiki](#)
- **Issues**: [GitHub Issues](#)
- **Community**: [Discord](#)

---

**Built with ❤️ by MATRIX Team**