// Utility functions

// Copy text to clipboard with modern API
export function copyToClipboard(elementId) {
    const codeElement = document.getElementById(elementId);
    const copyText = codeElement ? codeElement.innerText : '';
    
    if (!copyText.trim()) {
        alert('No code to copy. Please generate a contract first.');
        return;
    }
    
    if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API
        navigator.clipboard.writeText(copyText).then(() => {
            showCopySuccess();
            window.open("https://remix.ethereum.org", '_blank');
        }).catch(err => {
            console.error('Failed to copy with clipboard API:', err);
            fallbackCopyTextToClipboard(copyText);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(copyText);
    }
}

// Show copy success message
function showCopySuccess() {
    // Create a temporary success message
    const message = document.createElement('div');
    message.textContent = '✅ Code copied to clipboard!';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    }, 3000);
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text) {
    const textarea = document.createElement("textarea");
    const currentFocus = document.activeElement;
    
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (currentFocus) currentFocus.focus();
        
        if (successful) {
            showCopySuccess();
            window.open("https://remix.ethereum.org", '_blank');
        } else {
            alert('Copy failed. Please manually select and copy the code.');
        }
    } catch (error) {
        console.error('Copy failed:', error);
        document.body.removeChild(textarea);
        if (currentFocus) currentFocus.focus();
        alert('Copy failed. Please manually select and copy the code.');
    }
}

// Loading functions
export function showLoading(message = 'Processing...') {
    const loadingDiv = document.getElementById('loadingOverlay');
    const loadingMessage = loadingDiv?.querySelector('.loading-message');
    const loadingDetails = loadingDiv?.querySelector('.loading-details');
    
    if (loadingDiv) {
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        if (loadingDetails) {
            loadingDetails.textContent = 'Please wait while we process your request...';
        }
        loadingDiv.style.display = 'block';
    }
}

export function hideLoading() {
    const loadingDiv = document.getElementById('loadingOverlay');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// History management
export class HistoryManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.totalItems = 0;
        this.data = [];
        this.loadData();
    }

    // Load data from localStorage
    loadData() {
        this.data = [];
        let index = 1;
        
        Object.keys(localStorage).forEach(key => {
            if (key !== 'web3AuthData') { // Exclude auth data
                this.data.push({
                    order: index,
                    message: key,
                    code: localStorage.getItem(key)
                });
                index++;
            }
        });
        
        this.totalItems = this.data.length;
    }

    // Get paginated data
    getPaginatedData() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.data.slice(startIndex, endIndex);
    }

    // Set page
    setPage(page) {
        const maxPage = Math.ceil(this.totalItems / this.itemsPerPage);
        if (page > maxPage) {
            this.currentPage = maxPage;
        } else if (page < 1) {
            this.currentPage = 1;
        } else {
            this.currentPage = page;
        }
    }

    // Set items per page
    setItemsPerPage(items) {
        this.itemsPerPage = items;
        this.currentPage = 1; // Reset to first page
    }

    // Get total pages
    getTotalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
    }

    // Add new item
    addItem(query, code) {
        localStorage.setItem(query, code);
        this.loadData(); // Reload data
    }

    // Get item by query
    getItem(query) {
        return localStorage.getItem(query);
    }
}

// Prism.js highlighting helper
export function highlightCode() {
    // Use Prism.js for syntax highlighting
    if (typeof window.Prism !== 'undefined' && window.Prism.highlightAll) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            try {
                window.Prism.highlightAll();
                console.log('Code highlighted successfully');
            } catch (error) {
                console.warn('Error highlighting code:', error);
            }
        }, 100);
    } else {
        console.warn('Prism.js not loaded. Syntax highlighting unavailable.');
        // Fallback - just ensure the code is visible
        setTimeout(() => {
            const codeBlocks = document.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                if (!block.classList.contains('language-solidity')) {
                    block.classList.add('language-solidity');
                }
            });
        }, 100);
    }
}

// Format address for display
export function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Validate Ethereum address
export function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}