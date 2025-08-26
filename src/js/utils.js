// Utility functions

// Copy text to clipboard
export function copyToClipboard(elementId) {
    const copyText = document.getElementById(elementId).innerText;
    copyTextToClipboard(copyText);
    alert("Code Copied");
    window.open("https://remix.ethereum.org", '_blank');
}

// Helper function to copy text
function copyTextToClipboard(text) {
    const textarea = document.createElement("textarea");
    const currentFocus = document.activeElement;
    const toolBoxwrap = document.getElementById('NewsToolBox');
    
    toolBoxwrap.appendChild(textarea);
    textarea.value = text;
    textarea.focus();
    
    if (textarea.setSelectionRange) {
        textarea.setSelectionRange(0, textarea.value.length);
    } else {
        textarea.select();
    }
    
    try {
        const flag = document.execCommand("copy");
        toolBoxwrap.removeChild(textarea);
        currentFocus.focus();
        return flag;
    } catch (error) {
        console.error('Copy failed:', error);
        toolBoxwrap.removeChild(textarea);
        currentFocus.focus();
        return false;
    }
}

// Loading functions
export function showLoading() {
    const loadingImg = "/assets/img/load2.gif";
    const loadingImgElement = document.querySelector(".loadingImg");
    const loadingDiv = document.querySelector(".loadingDiv");
    
    if (loadingImgElement && loadingDiv) {
        loadingImgElement.style.backgroundImage = `url('${loadingImg}')`;
        loadingDiv.style.display = 'block';
    }
}

export function hideLoading() {
    const loadingDiv = document.querySelector(".loadingDiv");
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