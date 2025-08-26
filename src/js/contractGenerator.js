// Contract Generation Engine - LLM-Powered Implementation
// Uses Vercel Functions with Large Language Models for intelligent contract generation

class ContractGenerator {
    constructor() {
        this.apiUrl = import.meta.env.VITE_BACKEND_API_URL || '/api';
        this.supportedTypes = null;
        this.initializeSupportedTypes();
    }

    // Initialize supported contract types from Vercel Functions
    async initializeSupportedTypes() {
        try {
            const response = await fetch(`${this.apiUrl}/types`);
            const data = await response.json();
            if (data.success) {
                this.supportedTypes = data.data;
            }
        } catch (error) {
            console.warn('Failed to load contract types from API:', error);
            // Fallback to basic types
            this.supportedTypes = [
                { type: 'erc20', name: 'ERC-20 Token', keywords: ['token', 'erc20', 'coin'] },
                { type: 'erc721', name: 'ERC-721 NFT', keywords: ['nft', 'collectible', 'art'] },
                { type: 'custom', name: 'Custom Contract', keywords: ['custom', 'specific'] }
            ];
        }
    }

    // Generate contract using LLM Vercel Function
    async generateContract(requirements, options = {}) {
        try {
            console.log('🚀 Generating contract using LLM Vercel Function...');
            
            // Show loading state
            this.showLoadingState('Analyzing requirements and generating contract...');
            
            const requestBody = {
                requirements: requirements,
                options: {
                    maxTokens: 4000,
                    temperature: 0.7,
                    ...options
                }
            };

            // Add contract type if detected
            const detectedType = this.detectContractType(requirements);
            if (detectedType && detectedType !== 'custom') {
                requestBody.contractType = detectedType;
            }

            const response = await fetch(`${this.apiUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            this.hideLoadingState();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Contract generation failed');
            }

            if (data.success && data.data) {
                console.log('✅ Contract generated successfully');
                return {
                    contract: data.data.contract,
                    metadata: data.data.metadata
                };
            } else {
                throw new Error('Invalid response from contract generation API');
            }
            
        } catch (error) {
            this.hideLoadingState();
            console.error('❌ Contract generation error:', error);
            throw new Error(`Contract generation failed: ${error.message}`);
        }
    }

    // Detect contract type from requirements
    detectContractType(requirements) {
        if (!this.supportedTypes) {
            return 'custom';
        }

        const text = requirements.toLowerCase();
        
        for (const typeInfo of this.supportedTypes) {
            for (const keyword of typeInfo.keywords) {
                if (text.includes(keyword)) {
                    return typeInfo.type;
                }
            }
        }
        
        return 'custom';
    }

    // Show loading state during contract generation
    showLoadingState(message = 'Generating contract...') {
        const resultContainer = document.getElementById('contractResult');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-message">${message}</p>
                    <div class="loading-details">
                        <small>Using AI to analyze requirements and generate optimized Solidity code...</small>
                    </div>
                </div>
            `;
            resultContainer.style.display = 'block';
        }
    }

    // Hide loading state
    hideLoadingState() {
        const loadingContainer = document.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.remove();
        }
    }

    // Get supported contract types
    getSupportedTypes() {
        return this.supportedTypes || [];
    }

    // Check Vercel Functions API health
    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            const data = await response.json();
            return data.status === 'OK';
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }

    // Generate error message for UI
    generateErrorMessage(error) {
        let errorMessage = 'Contract generation failed. ';
        
        if (error.message.includes('API key')) {
            errorMessage += 'Please check your API configuration.';
        } else if (error.message.includes('rate limit')) {
            errorMessage += 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('timeout')) {
            errorMessage += 'Request timed out. Please try again.';
        } else {
            errorMessage += error.message;
        }

        return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ContractGenerationError
 * @dev ${errorMessage}
 * @notice Please refine your requirements and try again
 */
contract ContractGenerationError {
    string public constant ERROR_MESSAGE = "${error.message}";
    
    constructor() {
        // This contract serves as an error placeholder
        // Please provide more specific requirements for contract generation
    }
}`;
    }
}

export default ContractGenerator;