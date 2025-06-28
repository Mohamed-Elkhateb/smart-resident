// IMPORTANT: Replace these with your actual deployed values
const COGNITO_USER_POOL_ID = 'YOUR_USER_POOL_ID';
const COGNITO_CLIENT_ID = 'YOUR_USER_POOL_CLIENT_ID';
const API_BASE_URL = 'YOUR_API_GATEWAY_INVOKE_URL_HERE';

// Configure Amplify
Amplify.configure({
    Auth: {
        userPoolId: COGNITO_USER_POOL_ID,
        userPoolWebClientId: COGNITO_CLIENT_ID,
        region: 'us-east-1' // Update with your region
    }
});

async function fetchData(path) {
    try {
        const session = await Amplify.Auth.currentSession();
        const token = session.getIdToken().getJwtToken();
        
        const response = await fetch(`${API_BASE_URL}${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        if (error.message.includes('No current user')) {
            showLoginForm();
        }
        displayStatusMessage('Failed to load data. Please try again.', 'error');
        throw error;
    }
}

function displayStatusMessage(message, type) {
    let statusDiv = document.getElementById('status-message');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'status-message';
        statusDiv.classList.add('status-message');
        document.querySelector('.container').prepend(statusDiv);
    }
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Authentication Functions
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('confirm-signup-form').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('app-section').style.display = 'none';
}

function showSignupForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('confirm-signup-form').style.display = 'none';
}

function showConfirmSignupForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('confirm-signup-form').style.display = 'block';
}

function showAppSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    loadDevices();
}

async function signIn() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
        displayStatusMessage('Please enter username and password.', 'error');
        return;
    }

    try {
        await Amplify.Auth.signIn(username, password);
        displayStatusMessage('Login successful!', 'success');
        showAppSection();
    } catch (error) {
        displayStatusMessage(`Login error: ${error.message}`, 'error');
    }
}

async function signUp() {
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const passwordConfirm = document.getElementById('signup-password-confirm').value.trim();

    if (!username || !password || !passwordConfirm) {
        displayStatusMessage('Please fill in all fields.', 'error');
        return;
    }
    if (password !== passwordConfirm) {
        displayStatusMessage('Passwords do not match.', 'error');
        return;
    }

    try {
        await Amplify.Auth.signUp({
            username: username,
            password: password,
            attributes: {
                email: username
            }
        });
        displayStatusMessage('Sign up successful! Please confirm your email.', 'success');
        document.getElementById('confirm-username').value = username;
        showConfirmSignupForm();
    } catch (error) {
        displayStatusMessage(`Sign up error: ${error.message}`, 'error');
    }
}

async function confirmSignUp() {
    const username = document.getElementById('confirm-username').value.trim();
    const code = document.getElementById('confirm-code').value.trim();

    if (!username || !code) {
        displayStatusMessage('Please enter username and code.', 'error');
        return;
    }

    try {
        await Amplify.Auth.confirmSignUp(username, code);
        displayStatusMessage('Account confirmed! You can now log in.', 'success');
        showLoginForm();
    } catch (error) {
        displayStatusMessage(`Confirmation error: ${error.message}`, 'error');
    }
}

async function resendConfirmationCode() {
    const username = document.getElementById('confirm-username').value.trim();
    if (!username) {
        displayStatusMessage('Please enter your username.', 'error');
        return;
    }
    try {
        await Amplify.Auth.resendSignUpCode(username);
        displayStatusMessage('Code resent!', 'success');
    } catch (error) {
        displayStatusMessage(`Resend error: ${error.message}`, 'error');
    }
}

async function signOut() {
    try {
        await Amplify.Auth.signOut();
        displayStatusMessage('Logged out successfully.', 'success');
        showLoginForm();
    } catch (error) {
        displayStatusMessage(`Logout error: ${error.message}`, 'error');
    }
}

// Load Devices Function
async function loadDevices() {
    const deviceListDiv = document.getElementById('device-list');
    deviceListDiv.innerHTML = '<p>Loading devices...</p>';

    try {
        const data = await fetchData('/devices');
        const devices = data.devices || [];

        deviceListDiv.innerHTML = '';

        if (devices.length === 0) {
            deviceListDiv.innerHTML = '<p>No devices found.</p>';
            return;
        }

        devices.forEach(device => {
            const deviceItem = document.createElement('div');
            deviceItem.classList.add('device-item');

            let statusClass = 'device-status-default';
            if (typeof device.status === 'string') {
                const lowerCaseStatus = device.status.toLowerCase();
                if (lowerCaseStatus === 'on' || lowerCaseStatus === 'active' || lowerCaseStatus.includes('open') || lowerCaseStatus.includes('unlocked')) {
                    statusClass = 'device-status-on';
                } else if (lowerCaseStatus === 'off' || lowerCaseStatus === 'inactive' || lowerCaseStatus.includes('closed') || lowerCaseStatus.includes('locked')) {
                    statusClass = 'device-status-off';
                }
            }
            
            deviceItem.innerHTML = `
                <div class="device-info">
                    <p><strong>${device.name}</strong> (${device.type})</p>
                    <p>Location: ${device.location || 'N/A'}</p>
                    <p>Status: <span class="${statusClass}">${device.status}</span></p>
                    <p style="font-size: 0.8em; color: #666;">Last Updated: ${new Date(device.lastUpdated).toLocaleDateString()} ${new Date(device.lastUpdated).toLocaleTimeString()}</p>
                </div>
            `;
            deviceListDiv.appendChild(deviceItem);
        });

    } catch (error) {
        deviceListDiv.innerHTML = '<p style="color: red;">Failed to load devices.</p>';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check current auth status on load
    Amplify.Auth.currentAuthenticatedUser()
        .then(user => {
            showAppSection();
        })
        .catch(() => {
            showLoginForm();
        });

    // Authentication form listeners
    document.getElementById('show-signup').addEventListener('click', (e) => { e.preventDefault(); showSignupForm(); });
    document.getElementById('show-login').addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });
    document.getElementById('login-btn').addEventListener('click', signIn);
    document.getElementById('signup-btn').addEventListener('click', signUp);
    document.getElementById('confirm-signup-btn').addEventListener('click', confirmSignUp);
    document.getElementById('resend-code-btn').addEventListener('click', resendConfirmationCode);
    document.getElementById('logout-btn').addEventListener('click', signOut);

    document.getElementById('refresh-devices-btn').addEventListener('click', loadDevices);
});