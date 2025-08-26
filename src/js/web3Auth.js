// Web3 Authentication Module
import { ethers } from 'ethers';

class Web3Auth {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.chainId = null;
        this.isAuthenticated = false;
        
        // Configuration
        this.config = {
            moralisApiKey: import.meta.env.VITE_MORALIS_API_KEY || 'TCU2F2MYHpQxMNrRlCQkfnE6sYOky1KPn27cbp49dzA2T0UqrLtQpuDcEl8mAiSz',
            domain: import.meta.env.VITE_WEB3_DOMAIN || window.location.hostname,
            uri: import.meta.env.VITE_WEB3_URI || window.location.origin,
            chainId: parseInt(import.meta.env.VITE_WEB3_CHAIN_ID || '1'),
            moralisEndpoint: 'https://authapi.moralis.io/challenge'
        };
        
        // Log configuration for debugging
        console.log('Web3Auth Config:', {
            domain: this.config.domain,
            uri: this.config.uri,
            chainId: this.config.chainId,
            hasApiKey: !!this.config.moralisApiKey && this.config.moralisApiKey !== 'your-moralis-api-key-here'
        });
    }

    // Check if MetaMask is installed
    isMetaMaskInstalled() {
        return typeof window.ethereum !== 'undefined';
    }

    // Connect to MetaMask
    async connectToMetaMask() {
        if (!this.isMetaMaskInstalled()) {
            throw new Error('MetaMask is not installed');
        }

        try {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            
            // Request account access
            const accounts = await this.provider.send('eth_requestAccounts', []);
            this.chainId = await this.provider.send('eth_chainId', []);
            
            this.signer = await this.provider.getSigner();
            this.account = accounts[0];
            
            return {
                signer: this.signer,
                chain: this.chainId,
                account: this.account
            };
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            throw error;
        }
    }

    // Request authentication message from Moralis
    async requestMessage(address, chainId) {
        // Check if API key is configured
        if (!this.config.moralisApiKey || this.config.moralisApiKey === 'your-moralis-api-key-here') {
            throw new Error('Moralis API key is not configured. Please set VITE_MORALIS_API_KEY in your .env file.');
        }

        const requestObject = {
            domain: this.config.domain,
            chainId: parseInt(chainId, 16), // Convert hex to decimal
            address: address,
            statement: "Please confirm authentication to Intelligent Contract Platform",
            uri: this.config.uri,
            expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
            notBefore: new Date(Date.now() - 60 * 1000).toISOString(), // 1 minute ago
            timeout: 15
        };

        console.log('Requesting message with:', requestObject);

        try {
            const response = await fetch(`${this.config.moralisEndpoint}/request/evm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': this.config.moralisApiKey
                },
                body: JSON.stringify(requestObject)
            });

            const responseText = await response.text();
            console.log('Moralis response:', response.status, responseText);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage += ` - ${errorData.message || errorData.error || responseText}`;
                } catch (e) {
                    errorMessage += ` - ${responseText}`;
                }
                throw new Error(errorMessage);
            }

            return JSON.parse(responseText);
        } catch (error) {
            console.error('Error requesting message:', error);
            throw error;
        }
    }

    // Verify signature with Moralis
    async verifyMessage(message, signature) {
        const verifyObject = {
            message,
            signature,
            network: 'evm'
        };

        console.log('Verifying message with:', verifyObject);

        try {
            const response = await fetch(`${this.config.moralisEndpoint}/verify/evm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': this.config.moralisApiKey
                },
                body: JSON.stringify(verifyObject)
            });

            const responseText = await response.text();
            console.log('Verification response:', response.status, responseText);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage += ` - ${errorData.message || errorData.error || responseText}`;
                } catch (e) {
                    errorMessage += ` - ${responseText}`;
                }
                throw new Error(errorMessage);
            }

            return JSON.parse(responseText);
        } catch (error) {
            console.error('Error verifying message:', error);
            throw error;
        }
    }

    // Main authentication flow
    async authenticate() {
        try {
            // Step 1: Connect to MetaMask
            const { signer, chain, account } = await this.connectToMetaMask();
            
            if (!account) {
                throw new Error('No account found');
            }
            if (!chain) {
                throw new Error('No chain found');
            }

            // Step 2: Request message from Moralis
            const { message } = await this.requestMessage(account, chain);
            
            // Step 3: Sign message
            const signature = await signer.signMessage(message);
            
            // Step 4: Verify signature
            const verificationResult = await this.verifyMessage(message, signature);
            
            if (verificationResult.address) {
                this.isAuthenticated = true;
                
                // Store authentication data
                const authData = {
                    address: verificationResult.address,
                    chainId: chain,
                    message: message,
                    signature: signature,
                    timestamp: Date.now(),
                    verificationResult: verificationResult
                };
                
                localStorage.setItem('web3AuthData', JSON.stringify(authData));
                
                return {
                    success: true,
                    address: verificationResult.address,
                    authData: authData
                };
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Check if user is already authenticated
    isUserAuthenticated() {
        const authData = localStorage.getItem('web3AuthData');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                // Check if authentication is still valid (24 hours)
                const isValid = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
                this.isAuthenticated = isValid;
                if (isValid) {
                    this.account = parsed.address;
                }
                return isValid;
            } catch (error) {
                console.error('Error parsing auth data:', error);
                this.logout();
                return false;
            }
        }
        return false;
    }

    // Get stored authentication data
    getAuthData() {
        const authData = localStorage.getItem('web3AuthData');
        if (authData) {
            try {
                return JSON.parse(authData);
            } catch (error) {
                console.error('Error parsing auth data:', error);
                return null;
            }
        }
        return null;
    }

    // Logout user
    logout() {
        localStorage.removeItem('web3AuthData');
        this.isAuthenticated = false;
        this.account = null;
        this.signer = null;
        this.provider = null;
        this.chainId = null;
    }

    // Get current account
    getCurrentAccount() {
        return this.account;
    }
}

export default Web3Auth;