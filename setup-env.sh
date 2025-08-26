#!/bin/bash

# Setup script for Intelligent Contract Platform
echo "🔧 Setting up environment configuration..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
fi

echo ""
echo "🔑 Please obtain your Moralis API key:"
echo "1. Visit: https://moralis.io"
echo "2. Sign up for a free account"
echo "3. Go to: https://admin.moralis.io"
echo "4. Navigate to Web3 APIs"
echo "5. Copy your API key"
echo ""

read -p "Enter your Moralis API key: " api_key

if [ ! -z "$api_key" ]; then
    # Update .env file with the API key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/VITE_MORALIS_API_KEY=.*/VITE_MORALIS_API_KEY=$api_key/" .env
    else
        # Linux
        sed -i "s/VITE_MORALIS_API_KEY=.*/VITE_MORALIS_API_KEY=$api_key/" .env
    fi
    
    echo "✅ API key updated in .env file"
else
    echo "⚠️  No API key provided. Please update .env manually."
fi

echo ""
echo "🌐 Configure your domain settings:"
read -p "Enter your domain (default: localhost): " domain
domain=${domain:-localhost}

read -p "Enter your URI (default: http://localhost:3000): " uri
uri=${uri:-http://localhost:3000}

read -p "Enter chain ID (default: 1 for Ethereum mainnet): " chain_id
chain_id=${chain_id:-1}

# Update other environment variables
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/VITE_WEB3_DOMAIN=.*/VITE_WEB3_DOMAIN=$domain/" .env
    sed -i '' "s|VITE_WEB3_URI=.*|VITE_WEB3_URI=$uri|" .env
    sed -i '' "s/VITE_WEB3_CHAIN_ID=.*/VITE_WEB3_CHAIN_ID=$chain_id/" .env
else
    sed -i "s/VITE_WEB3_DOMAIN=.*/VITE_WEB3_DOMAIN=$domain/" .env
    sed -i "s|VITE_WEB3_URI=.*|VITE_WEB3_URI=$uri|" .env
    sed -i "s/VITE_WEB3_CHAIN_ID=.*/VITE_WEB3_CHAIN_ID=$chain_id/" .env
fi

echo ""
echo "✅ Environment configuration complete!"
echo ""
echo "📄 Current .env configuration:"
cat .env
echo ""
echo "🚀 Next steps:"
echo "1. npm install (if not already done)"
echo "2. npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Test the Web3 authentication"
echo ""
echo "📖 For more help, see README.md"