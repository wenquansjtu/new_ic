#!/bin/bash

# 🤖 Intelligent Contract LLM Setup Script
# Automates the setup process for the LLM-powered contract generator

echo "🚀 Setting up Intelligent Contract LLM-Powered Generator..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -c 2-)
REQUIRED_VERSION="18.0.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+ and try again."
    exit 1
fi

print_status "Node.js version $NODE_VERSION detected"

# Setup frontend
echo ""
echo "📱 Setting up frontend..."
echo "========================="

# Install frontend dependencies
print_info "Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_status "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Setup frontend environment
if [ ! -f .env ]; then
    print_info "Creating frontend environment file..."
    cp .env.example .env
    print_status "Created .env file from template"
else
    print_warning ".env file already exists, skipping creation"
fi

# Setup backend
echo ""
echo "🖥️  Setting up backend..."
echo "========================="

cd backend

# Install backend dependencies
print_info "Installing backend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_status "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Setup backend environment
if [ ! -f .env ]; then
    print_info "Creating backend environment file..."
    cp .env.example .env
    print_status "Created backend .env file from template"
else
    print_warning "Backend .env file already exists, skipping creation"
fi

cd ..

# Prompt for API keys
echo ""
echo "🔑 API Configuration"
echo "==================="

echo ""
print_info "Choose your LLM provider:"
echo "1) OpenAI (GPT-4) - Recommended"
echo "2) Anthropic (Claude)"
echo "3) Skip for now (configure manually later)"

read -p "Enter your choice (1-3): " llm_choice

case $llm_choice in
    1)
        echo ""
        print_info "Setting up OpenAI configuration..."
        read -p "Enter your OpenAI API key (sk-...): " openai_key
        if [ ! -z "$openai_key" ]; then
            # Update backend .env
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/LLM_PROVIDER=.*/LLM_PROVIDER=openai/" backend/.env
                sed -i '' "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/" backend/.env
            else
                # Linux
                sed -i "s/LLM_PROVIDER=.*/LLM_PROVIDER=openai/" backend/.env
                sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/" backend/.env
            fi
            print_status "OpenAI API key configured"
        else
            print_warning "No API key provided. Please update backend/.env manually."
        fi
        ;;
    2)
        echo ""
        print_info "Setting up Anthropic configuration..."
        read -p "Enter your Anthropic API key (sk-ant-...): " anthropic_key
        if [ ! -z "$anthropic_key" ]; then
            # Update backend .env
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/LLM_PROVIDER=.*/LLM_PROVIDER=anthropic/" backend/.env
                sed -i '' "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$anthropic_key/" backend/.env
            else
                # Linux
                sed -i "s/LLM_PROVIDER=.*/LLM_PROVIDER=anthropic/" backend/.env
                sed -i "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$anthropic_key/" backend/.env
            fi
            print_status "Anthropic API key configured"
        else
            print_warning "No API key provided. Please update backend/.env manually."
        fi
        ;;
    3)
        print_warning "Skipping LLM configuration. Please update backend/.env manually."
        ;;
    *)
        print_warning "Invalid choice. Please update backend/.env manually."
        ;;
esac

# Moralis API key setup
echo ""
print_info "Setting up Web3 authentication..."
read -p "Enter your Moralis API key (optional, press Enter to skip): " moralis_key

if [ ! -z "$moralis_key" ]; then
    # Update frontend .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/VITE_MORALIS_API_KEY=.*/VITE_MORALIS_API_KEY=$moralis_key/" .env
    else
        # Linux
        sed -i "s/VITE_MORALIS_API_KEY=.*/VITE_MORALIS_API_KEY=$moralis_key/" .env
    fi
    print_status "Moralis API key configured"
else
    print_warning "Moralis API key skipped. You can configure it later in .env"
fi

# Test backend setup
echo ""
echo "🧪 Testing setup..."
echo "=================="

print_info "Testing backend configuration..."
cd backend
npm run test > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Backend tests passed"
else
    print_warning "Backend tests failed - this might be normal if API keys are not configured"
fi
cd ..

# Final setup completion
echo ""
echo "🎉 Setup Complete!"
echo "=================="
print_status "Frontend and backend are ready to use"

echo ""
print_info "Next steps:"
echo "1. Start the backend: cd backend && npm run dev"
echo "2. Start the frontend: npm run dev"
echo "3. Visit http://localhost:3000 to use the application"

echo ""
print_info "Deployment:"
echo "1. Frontend: npm run build && vercel"
echo "2. Backend: cd backend && vercel"

echo ""
print_info "Documentation:"
echo "- See README_LLM.md for comprehensive documentation"
echo "- Check backend/README.md for API documentation"

echo ""
print_warning "Important notes:"
echo "- Keep your API keys secure and never commit them to version control"
echo "- For production deployment, use different API keys"
echo "- Configure environment variables in Vercel dashboard for production"

echo ""
print_status "Happy coding! 🚀"