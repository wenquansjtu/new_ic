// Profile page JavaScript
import Web3Auth from './web3Auth.js';

class ProfilePage {
    constructor() {
        this.web3Auth = new Web3Auth();
        this.init();
    }

    init() {
        const isAuthenticated = this.web3Auth.isUserAuthenticated();
        
        if (isAuthenticated) {
            this.showAuthenticatedContent();
        } else {
            this.showUnauthenticatedContent();
        }
        
        this.bindEvents();
    }

    showAuthenticatedContent() {
        const authContent = document.getElementById('authenticated-content');
        const unauthContent = document.getElementById('unauthenticated-content');
        
        authContent.style.display = 'block';
        unauthContent.style.display = 'none';
        
        const authData = this.web3Auth.getAuthData();
        if (authData) {
            // Display user address
            document.getElementById('profile-address').textContent = authData.address;
            
            // Display auth info
            this.populateAuthInfoTable(authData);
            
            // Display verified info
            this.populateVerifiedInfoTable(authData.verificationResult);
        }
    }

    showUnauthenticatedContent() {
        const authContent = document.getElementById('authenticated-content');
        const unauthContent = document.getElementById('unauthenticated-content');
        
        authContent.style.display = 'none';
        unauthContent.style.display = 'block';
    }

    populateAuthInfoTable(authData) {
        const tableBody = document.getElementById('auth-info-table');
        tableBody.innerHTML = '';
        
        const authInfo = {
            'Address': authData.address,
            'Chain ID': authData.chainId,
            'Message': authData.message,
            'Signature': authData.signature,
            'Timestamp': new Date(authData.timestamp).toLocaleString()
        };
        
        Object.entries(authInfo).forEach(([key, value]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold;">${key}</td>
                <td style="padding: 8px; border: 1px solid #ccc; word-break: break-all;">
                    <pre style="margin: 0; white-space: pre-wrap;">${value}</pre>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    populateVerifiedInfoTable(verificationResult) {
        const tableBody = document.getElementById('verified-info-table');
        tableBody.innerHTML = '';
        
        if (verificationResult) {
            Object.entries(verificationResult).forEach(([key, value]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold;">${key}</td>
                    <td style="padding: 8px; border: 1px solid #ccc; word-break: break-all;">${JSON.stringify(value)}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    bindEvents() {
        const logoutBtn = document.getElementById('profile-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    handleLogout() {
        this.web3Auth.logout();
        window.location.href = './index.html';
    }
}

// Initialize the profile page
new ProfilePage();