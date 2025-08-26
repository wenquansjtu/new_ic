// Main application JavaScript
import Web3Auth from './web3Auth.js';
import ContractGenerator from './contractGenerator.js';
import { copyToClipboard, showLoading, hideLoading, HistoryManager, highlightCode } from './utils.js';

class IntelligentContractApp {
    constructor() {
        this.web3Auth = new Web3Auth();
        this.contractGenerator = new ContractGenerator();
        this.historyManager = new HistoryManager();
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        // Check if user is already authenticated
        this.isAuthenticated = this.web3Auth.isUserAuthenticated();
        this.updateUI();
        this.bindEvents();
        this.setupHistory();
        this.setupPagination();
        this.updateCopyright();
        
        // Make copyToClipboard globally available
        window.copyToClipboard = copyToClipboard;
    }

    // Update copyright based on domain
    updateCopyright() {
        const currentDomain = window.location.hostname;
        console.log('Current domain:', currentDomain);
        const footerCopyright = document.querySelector('footer .footer-bottom p');
        
        if (footerCopyright && currentDomain === 'demo.xlex.ai') {
            footerCopyright.innerHTML = '&copy; 2025 <a>XLex</a>. All Rights Reserved.';
        }
    }

    // Update UI based on authentication status
    updateUI() {
        const userInfo = document.getElementById('user-info');
        const loginContainer = document.getElementById('login-btn-container');
        const generateBtn = document.getElementById('generate-btn');
        const userAddress = document.getElementById('user-address');

        if (this.isAuthenticated) {
            const authData = this.web3Auth.getAuthData();
            if (authData) {
                userInfo.style.display = 'block';
                loginContainer.style.display = 'none';
                userAddress.textContent = authData.address;
                generateBtn.textContent = 'Generate';
                generateBtn.onclick = () => this.generateContract();
            }
        } else {
            userInfo.style.display = 'none';
            loginContainer.style.display = 'block';
            generateBtn.textContent = 'Generate';
            generateBtn.onclick = () => this.handleAuthRequired();
        }
    }

    // Bind event listeners
    bindEvents() {
        // Login button
        const authButton = document.getElementById('auth-metamask');
        if (authButton) {
            authButton.addEventListener('click', () => this.handleAuth());
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Pagination controls
        const goPageBtn = document.getElementById('go-page-btn');
        if (goPageBtn) {
            goPageBtn.addEventListener('click', () => this.handlePageJump());
        }

        const pageLimitSelect = document.getElementById('page-limit');
        if (pageLimitSelect) {
            pageLimitSelect.addEventListener('change', (e) => {
                this.historyManager.setItemsPerPage(parseInt(e.target.value));
                this.updateHistoryTable();
                this.updatePagination();
            });
        }
    }

    // Handle authentication
    async handleAuth() {
        try {
            showLoading();
            const result = await this.web3Auth.authenticate();
            
            if (result.success) {
                this.isAuthenticated = true;
                this.updateUI();
                location.reload(); // Refresh to update the entire page
            } else {
                alert('Authentication failed: ' + result.error);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert('Authentication error: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    // Handle logout
    handleLogout() {
        this.web3Auth.logout();
        this.isAuthenticated = false;
        location.reload(); // Refresh to update the entire page
    }

    // Handle authentication required for generation
    handleAuthRequired() {
        alert('Please login with MetaMask first to generate contracts.');
        this.handleAuth();
    }

    // Generate contract code
    async generateContract() {
        const messageInput = document.getElementById('message');
        const message = messageInput.value.trim();

        if (!message) {
            alert('Please enter contract requirements first.');
            return;
        }

        if (!this.isAuthenticated) {
            this.handleAuthRequired();
            return;
        }

        try {
            showLoading('Generating contract using AI...');
            
            // Call the contract generation API
            const response = await this.callGenerationAPI(message);
            
            if (response && response.text) {
                // Display the generated code
                this.displayGeneratedCode(response.text);
                
                // Show success/error message based on response
                if (response.error) {
                    this.showMessage(`Generation completed with issues: ${response.message}`, 'warning');
                } else {
                    this.showMessage('✅ Contract generated successfully using AI!', 'success');
                    
                    // Log metadata if available
                    if (response.metadata) {
                        console.log('📊 Generation metadata:', response.metadata);
                    }
                }
                
                // Save to history
                this.historyManager.addItem(message, response.text);
                this.updateHistoryTable();
                this.updatePagination();
                
                // Clear the input
                messageInput.value = '';
            } else {
                alert('Failed to generate contract. Please try again.');
            }
        } catch (error) {
            console.error('Generation error:', error);
            this.showMessage(`❌ Error generating contract: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    // Call contract generation API
    async callGenerationAPI(question) {
        try {
            // Use LLM-powered contract generator with Vercel Functions
            console.log('🤖 Generating contract using LLM Vercel Functions for:', question);
            
            const result = await this.contractGenerator.generateContract(question);
            
            return {
                text: result.contract,
                metadata: result.metadata
            };
        } catch (error) {
            console.error('❌ LLM generation failed:', error);
            
            // Check if it's an API connectivity issue
            const isApiAvailable = await this.contractGenerator.checkBackendHealth();
            
            if (!isApiAvailable) {
                throw new Error('API service is unavailable. Please check your internet connection or try again later.');
            }
            
            // Return error contract with details
            const errorContract = this.contractGenerator.generateErrorMessage(error);
            
            return {
                text: errorContract,
                error: true,
                message: error.message
            };
        }
    }

    // Display generated code
    displayGeneratedCode(code) {
        const textToCopy = document.getElementById('textToCopy');
        const codeElement = document.getElementById('copyText1');
        
        if (codeElement) {
            codeElement.textContent = code;
            highlightCode();
        }
    }

    // Setup history functionality
    setupHistory() {
        this.updateHistoryTable();
    }

    // Update history table
    updateHistoryTable() {
        const tableBody = document.getElementById('history-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        const paginatedData = this.historyManager.getPaginatedData();

        paginatedData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="contract-list-xh">${item.order}</td>
                <td class="contract-list-lb" style="cursor: pointer;" onclick="app.showHistoryCode('${item.message.replace(/'/g, "\\'")}')">
                    ${item.message}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Show history code
    showHistoryCode(query) {
        const code = this.historyManager.getItem(query);
        if (code) {
            const textToCopy = document.getElementById('textToCopy-1');
            const codeElement = document.getElementById('copyText2');
            
            if (codeElement) {
                codeElement.textContent = code;
                highlightCode();
            }
        }
    }

    // Setup pagination
    setupPagination() {
        this.updatePagination();
    }

    // Update pagination controls
    updatePagination() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        const totalPages = this.historyManager.getTotalPages();
        const currentPage = this.historyManager.currentPage;

        let paginationHTML = '';
        
        // Previous button
        if (currentPage > 1) {
            paginationHTML += `<span onclick="app.changePage(${currentPage - 1})" style="cursor: pointer; margin: 0 5px; padding: 5px 10px; border: 1px solid #ccc;">Previous</span>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<span style="margin: 0 5px; padding: 5px 10px; border: 1px solid #ccc; background: #514f7f; color: white;">${i}</span>`;
            } else {
                paginationHTML += `<span onclick="app.changePage(${i})" style="cursor: pointer; margin: 0 5px; padding: 5px 10px; border: 1px solid #ccc;">${i}</span>`;
            }
        }

        // Next button
        if (currentPage < totalPages) {
            paginationHTML += `<span onclick="app.changePage(${currentPage + 1})" style="cursor: pointer; margin: 0 5px; padding: 5px 10px; border: 1px solid #ccc;">Next</span>`;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    // Change page
    changePage(page) {
        this.historyManager.setPage(page);
        this.updateHistoryTable();
        this.updatePagination();
    }

    // Handle page jump
    handlePageJump() {
        const pageInput = document.getElementById('page-input');
        const page = parseInt(pageInput.value);
        
        if (page && page > 0) {
            this.changePage(page);
            pageInput.value = '';
        }
    }

    // Show user messages with different types
    showMessage(message, type = 'info') {
        // Create or get message container
        let messageContainer = document.getElementById('message-container');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'message-container';
            messageContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 400px;
            `;
            document.body.appendChild(messageContainer);
        }

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            cursor: pointer;
            transition: opacity 0.3s ease;
        `;

        // Set colors based on type
        const colors = {
            success: { bg: '#d4edda', border: '#c3e6cb', color: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', color: '#721c24' },
            warning: { bg: '#fff3cd', border: '#ffeaa7', color: '#856404' },
            info: { bg: '#d1ecf1', border: '#bee5eb', color: '#0c5460' }
        };

        const typeColors = colors[type] || colors.info;
        messageElement.style.backgroundColor = typeColors.bg;
        messageElement.style.borderLeft = `4px solid ${typeColors.border}`;
        messageElement.style.color = typeColors.color;
        messageElement.textContent = message;

        // Add click to dismiss
        messageElement.onclick = () => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        };

        messageContainer.appendChild(messageElement);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.opacity = '0';
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Initialize the application
const app = new IntelligentContractApp();

// Make app globally available for onclick handlers
window.app = app;