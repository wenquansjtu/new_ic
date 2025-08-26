#!/bin/bash

# 🚀 Intelligent Contract LLM Setup Script (Vercel Functions)
# Automates the setup process for the LLM-powered contract generator with Vercel Functions

echo \"🤖 Setting up Intelligent Contract LLM-Powered Generator (Vercel Functions)...\"
echo \"=====================================================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${GREEN}✅ $1${NC}\"
}

print_warning() {
    echo -e \"${YELLOW}⚠️  $1${NC}\"
}

print_error() {
    echo -e \"${RED}❌ $1${NC}\"
}

print_info() {
    echo -e \"${BLUE}ℹ️  $1${NC}\"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error \"Node.js is not installed. Please install Node.js 18+ and try again.\"
    exit 1
fi

NODE_VERSION=$(node -v | cut -c 2-)
REQUIRED_VERSION=\"18.0.0\"
if [ \"$(printf '%s\\n' \"$REQUIRED_VERSION\" \"$NODE_VERSION\" | sort -V | head -n1)\" != \"$REQUIRED_VERSION\" ]; then
    print_error \"Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+ and try again.\"
    exit 1
fi

print_status \"Node.js version $NODE_VERSION detected\"

# Setup project
echo \"\"
echo \"📦 Setting up project...\"
echo \"========================\"

# Install dependencies
print_info \"Installing project dependencies...\"
npm install
if [ $? -eq 0 ]; then
    print_status \"Dependencies installed successfully\"
else
    print_error \"Failed to install dependencies\"
    exit 1
fi

# Setup environment files
if [ ! -f .env ]; then
    print_info \"Creating environment file...\"
    cp .env.example .env
    print_status \"Created .env file from template\"
else
    print_warning \".env file already exists, skipping creation\"
fi

if [ ! -f .env.local ]; then
    print_info \"Creating Vercel Functions environment file...\"
    cat > .env.local << 'EOF'
# Vercel Functions Environment Variables
# These are used by the API functions in /api directory

# LLM Provider Configuration
LLM_PROVIDER=openai

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7

# Anthropic Configuration (Alternative)
# LLM_PROVIDER=anthropic
# ANTHROPIC_API_KEY=your-anthropic-api-key-here
# ANTHROPIC_MODEL=claude-3-sonnet-20240229
# ANTHROPIC_MAX_TOKENS=4000
# ANTHROPIC_TEMPERATURE=0.7

# Environment
NODE_ENV=development
EOF
    print_status \"Created .env.local file for Vercel Functions\"
else
    print_warning \".env.local file already exists, skipping creation\"
fi

# Prompt for API keys
echo \"\"
echo \"🔑 API Configuration\"
echo \"===================\"

echo \"\"
print_info \"Choose your LLM provider:\"
echo \"1) OpenAI (GPT-4) - Recommended\"
echo \"2) Anthropic (Claude)\"
echo \"3) Skip for now (configure manually later)\"

read -p \"Enter your choice (1-3): \" llm_choice

case $llm_choice in
    1)
        echo \"\"
        print_info \"Setting up OpenAI configuration...\"
        read -p \"Enter your OpenAI API key (sk-...): \" openai_key
        if [ ! -z \"$openai_key\" ]; then
            # Update .env.local
            if [[ \"$OSTYPE\" == \"darwin\"* ]]; then
                # macOS
                sed -i '' \"s/LLM_PROVIDER=.*/LLM_PROVIDER=openai/\" .env.local
                sed -i '' \"s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/\" .env.local
            else
                # Linux
                sed -i \"s/LLM_PROVIDER=.*/LLM_PROVIDER=openai/\" .env.local
                sed -i \"s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/\" .env.local
            fi
            print_status \"OpenAI API key configured\"
        else
            print_warning \"No API key provided. Please update .env.local manually.\"
        fi
        ;;
    2)
        echo \"\"
        print_info \"Setting up Anthropic configuration...\"
        read -p \"Enter your Anthropic API key (sk-ant-...): \" anthropic_key
        if [ ! -z \"$anthropic_key\" ]; then
            # Update .env.local
            if [[ \"$OSTYPE\" == \"darwin\"* ]]; then
                # macOS
                sed -i '' \"s/LLM_PROVIDER=.*/LLM_PROVIDER=anthropic/\" .env.local
                sed -i '' \"s/# ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$anthropic_key/\" .env.local
                sed -i '' \"s/# LLM_PROVIDER=anthropic/LLM_PROVIDER=anthropic/\" .env.local
            else
                # Linux
                sed -i \"s/LLM_PROVIDER=.*/LLM_PROVIDER=anthropic/\" .env.local
                sed -i \"s/# ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$anthropic_key/\" .env.local
                sed -i \"s/# LLM_PROVIDER=anthropic/LLM_PROVIDER=anthropic/\" .env.local
            fi
            print_status \"Anthropic API key configured\"
        else
            print_warning \"No API key provided. Please update .env.local manually.\"
        fi
        ;;
    3)
        print_warning \"Skipping LLM configuration. Please update .env.local manually.\"
        ;;
    *)
        print_warning \"Invalid choice. Please update .env.local manually.\"
        ;;
esac

# Moralis API key setup
echo \"\"
print_info \"Setting up Web3 authentication...\"
read -p \"Enter your Moralis API key (optional, press Enter to skip): \" moralis_key

if [ ! -z \"$moralis_key\" ]; then
    # Update .env
    if [[ \"$OSTYPE\" == \"darwin\"* ]]; then
        # macOS
        sed -i '' \"s/VITE_MORALIS_API_KEY=.*/VITE_MORALIS_API_KEY=$moralis_key/\" .env
    else
        # Linux
        sed -i \"s/VITE_MORALIS_API_KEY=.*/VITE_MORALIS_API_KEY=$moralis_key/\" .env
    fi
    print_status \"Moralis API key configured\"
else
    print_warning \"Moralis API key skipped. You can configure it later in .env\"
fi

# Final setup completion
echo \"\"
echo \"🎉 Setup Complete!\"
echo \"==================\"
print_status \"Vercel Functions-based application is ready to use\"

echo \"\"
print_info \"Next steps:\"
echo \"1. Start the development server: npm run dev\"
echo \"2. Visit http://localhost:3000 to use the application\"
echo \"3. Test the API endpoints:\"
echo \"   - http://localhost:3000/api/health\"
echo \"   - http://localhost:3000/api/types\"

echo \"\"
print_info \"Deployment:\"
echo \"1. Install Vercel CLI: npm i -g vercel\"
echo \"2. Deploy: vercel\"
echo \"3. Set environment variables in Vercel dashboard\"

echo \"\"
print_info \"API Endpoints:\"
echo \"- POST /api/generate - Generate smart contracts\"
echo \"- GET /api/health - Check system health\"
echo \"- GET /api/types - Get supported contract types\"

echo \"\"
print_info \"Documentation:\"
echo \"- See README_VERCEL.md for comprehensive documentation\"
echo \"- Check the /api directory for function implementations\"

echo \"\"
print_warning \"Important notes:\"
echo \"- Keep your API keys secure and never commit them to version control\"
echo \"- For production deployment, set environment variables in Vercel dashboard\"
echo \"- The application uses Vercel Functions - no separate backend needed\"
echo \"- Rate limiting is built-in (10 requests per IP per 15 minutes)\"

echo \"\"
print_status \"Happy coding with AI-powered smart contracts! 🚀\"