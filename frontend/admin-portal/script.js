// IMPORTANT: Replace these with your actual deployed values
// You will get these from CloudFormation Outputs after `sam deploy`
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

// --- UI Element References ---
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const confirmSignupForm = document.getElementById('confirm-signup-form');
const welcomeMessage = document.getElementById('welcome-message');

// --- Helper Functions ---
async function fetchData(method, path, body = null) {
    try {
        const session = await Amplify.Auth.currentSession();
        const token = session.getIdToken().getJwtToken();
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_BASE_URL}${path}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API call error:', error);
        if (error.message.includes('No current user')) {
            showLoginForm();
        }
        displayStatusMessage(`Error: ${error.message}`, 'error');
        throw error;
    }
}

function displayStatusMessage(message, type) {
    let statusDiv = document.getElementById('status-message');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'status-message';
        statusDiv.classList.add('status-message');
        document.querySelector('.container').prepend(statusDiv); // Add to the top
    }
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`; // 'success' or 'error'
    statusDiv.style.display = 'block';

    // Auto-hide after some time
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

function clearAddForm() {
    document.getElementById('add-device-id').value = '';
    document.getElementById('add-device-name').value = '';
    document.getElementById('add-device-type').value = '';
    document.getElementById('add-device-location').value = '';
    document.getElementById('add-device-status').value = '';
    document.getElementById('add-device-properties').value = '';
}

function showLoginForm() {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    confirmSignupForm.style.display = 'none';
    authSection.style.display = 'block';
    appSection.style.display = 'none';
    welcomeMessage.textContent = '';
}

function showSignupForm() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    confirmSignupForm.style.display = 'none';
    authSection.style.display = 'block';
    appSection.style.display = 'none';
    welcomeMessage.textContent = '';
}

function showConfirmSignupForm() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    confirmSignupForm.style.display = 'block';
    authSection.style.display = 'block';
    appSection.style.display = 'none';
    welcomeMessage.textContent = '';
}

async function showAppSection() {
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    try {
        const user = await Amplify.Auth.currentAuthenticatedUser();
        welcomeMessage.textContent = `Welcome, ${user.username}!`; // Or user.attributes.email
    } catch (e) {
        welcomeMessage.textContent = 'Welcome!';
    }
    loadDevices(); // Load devices once logged in
}


// --- Authentication Functions ---

async function signUp() {
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const passwordConfirm = document.getElementById('signup-password-confirm').value.trim();

    if (!username || !password || !passwordConfirm) {
        displayStatusMessage('Please fill in all signup fields.', 'error');
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
        displayStatusMessage('Please enter username and verification code.', 'error');
        return;
    }

    try {
        await Amplify.Auth.confirmSignUp(username, code);
        displayStatusMessage('Account confirmed successfully! You can now log in.', 'success');
        showLoginForm();
    } catch (error) {
        console.error('Error confirming signup:', error);
        displayStatusMessage(`Confirmation error: ${error.message || JSON.stringify(error)}`, 'error');
    }
}

async function resendConfirmationCode() {
    const username = document.getElementById('confirm-username').value.trim();
    if (!username) {
        displayStatusMessage('Please enter your username (email) to resend the code.', 'error');
        return;
    }
    try {
        await Amplify.Auth.resendSignUpCode(username);
        displayStatusMessage('Confirmation code resent!', 'success');
    } catch (error) {
        console.error('Error resending code:', error);
        displayStatusMessage(`Resend code error: ${error.message || JSON.stringify(error)}`, 'error');
    }
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
        console.error('Error signing in:', error);
        displayStatusMessage(`Login error: ${error.message || JSON.stringify(error)}`, 'error');
    }
}

async function signOut() {
    try {
        await Amplify.Auth.signOut();
        displayStatusMessage('Logged out successfully.', 'success');
        showLoginForm();
    } catch (error) {
        console.error('Error signing out:', error);
        displayStatusMessage(`Logout error: ${error.message || JSON.stringify(error)}`, 'error');
    }
}


// --- CRUD Operations (modified to use fetchData with Amplify.API) ---

async function addDevice() {
    // ... (existing logic to gather form data) ...
    const deviceId = document.getElementById('add-device-id').value.trim();
    const name = document.getElementById('add-device-name').value.trim();
    const type = document.getElementById('add-device-type').value.trim();
    const location = document.getElementById('add-device-location').value.trim();
    const status = document.getElementById('add-device-status').value.trim();
    const propertiesText = document.getElementById('add-device-properties').value.trim();

    if (!name || !type || !status) {
        displayStatusMessage('Name, Type, and Status are required fields.', 'error');
        return;
    }

    let properties = {};
    if (propertiesText) {
        try {
            properties = JSON.parse(propertiesText);
            if (typeof properties !== 'object' || properties === null) {
                throw new Error("Properties must be a valid JSON object.");
            }
        } catch (e) {
            displayStatusMessage('Invalid JSON format for properties. Please use valid JSON like {"key": "value"}.', 'error');
            return;
        }
    }

    const deviceData = { name, type, status };
    if (deviceId) deviceData.deviceId = deviceId;
    if (location) deviceData.location = location;
    if (Object.keys(properties).length > 0) deviceData.properties = properties;

    try {
        await fetchData('POST', '/devices', deviceData);
        displayStatusMessage('Device added successfully!', 'success');
        clearAddForm();
        loadDevices(); // Refresh list
    } catch (error) {
        // Error already handled by fetchData
    }
}

async function loadDevices() {
    const deviceListDiv = document.getElementById('device-list');
    deviceListDiv.innerHTML = '<p>Loading devices...</p>'; // Show loading message

    try {
        const data = await fetchData('GET', '/devices');
        const devices = data.devices || [];

        deviceListDiv.innerHTML = ''; // Clear loading message

        if (devices.length === 0) {
            deviceListDiv.innerHTML = '<p>No devices found.</p>';
            return;
        }

        devices.forEach(device => {
            const deviceItem = document.createElement('div');
            deviceItem.classList.add('device-item');
            deviceItem.innerHTML = `
                <div class="device-info">
                    <p><strong>ID:</strong> ${device.deviceId}</p>
                    <p><strong>Name:</strong> ${device.name}</p>
                    <p><strong>Type:</strong> ${device.type}</p>
                    <p><strong>Location:</strong> ${device.location || 'N/A'}</p>
                    <p><strong>Status:</strong> ${device.status}</p>
                    <p><strong>Last Updated:</strong> ${new Date(device.lastUpdated).toLocaleString()}</p>
                    ${device.properties ? `<p><strong>Properties:</strong> ${JSON.stringify(device.properties)}</p>` : ''}
                </div>
                <div class="device-actions">
                    <button class="edit-btn" data-id="${device.deviceId}" data-name="${device.name}" data-type="${device.type}" data-location="${device.location || ''}" data-status="${device.status}" data-properties='${JSON.stringify(device.properties || {})}' >Edit</button>
                    <button class="delete-btn" data-id="${device.deviceId}">Delete</button>
                </div>
            `;
            deviceListDiv.appendChild(deviceItem);
        });

        // Attach event listeners to dynamically created buttons
        deviceListDiv.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const name = e.target.dataset.name;
                const type = e.target.dataset.type;
                const location = e.target.dataset.location;
                const status = e.target.dataset.status;
                const properties = JSON.parse(e.target.dataset.properties);

                // Populate the update form with selected device data
                document.getElementById('update-device-id').value = id;
                document.getElementById('update-device-status').value = status; // Initial status for quick update
                // You could extend this to populate other fields for a more comprehensive edit form
                displayStatusMessage(`Populated update form for ${name} (${id})`, 'success');
            });
        });

        deviceListDiv.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const idToDelete = e.target.dataset.id;
                if (confirm(`Are you sure you want to delete device with ID: ${idToDelete}?`)) {
                    deleteDevice(idToDelete);
                }
            });
        });


    } catch (error) {
        deviceListDiv.innerHTML = '<p style="color: red;">Failed to load devices.</p>';
        // Error already handled by fetchData
    }
}


async function updateDevice() {
    const deviceId = document.getElementById('update-device-id').value.trim();
    const newStatus = document.getElementById('update-device-status').value.trim();

    if (!deviceId) {
        displayStatusMessage('Please enter a Device ID to update.', 'error');
        return;
    }
    if (!newStatus) {
        displayStatusMessage('Please enter a new status.', 'error');
        return;
    }

    try {
        await fetchData('PUT', `/devices/${deviceId}`, { status: newStatus }); // Only sending status for this simple example
        displayStatusMessage(`Device ${deviceId} updated successfully!`, 'success');
        document.getElementById('update-device-id').value = '';
        document.getElementById('update-device-status').value = '';
        loadDevices(); // Refresh list
    } catch (error) {
        // Error already handled by fetchData
    }
}

async function deleteDevice(deviceIdToDelete = null) {
    const deviceId = deviceIdToDelete || document.getElementById('delete-device-id').value.trim();

    if (!deviceId) {
        displayStatusMessage('Please enter a Device ID to delete.', 'error');
        return;
    }

    try {
        await fetchData('DELETE', `/devices/${deviceId}`);
        displayStatusMessage(`Device ${deviceId} deleted successfully!`, 'success');
        if (!deviceIdToDelete) { // Clear input only if deleted via input field
             document.getElementById('delete-device-id').value = '';
        }
        loadDevices(); // Refresh list
    } catch (error) {
        // Error already handled by fetchData
    }
}


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

    // CRUD operation listeners
    document.getElementById('add-device-btn').addEventListener('click', addDevice);
    document.getElementById('refresh-devices-btn').addEventListener('click', loadDevices);
    document.getElementById('update-device-btn').addEventListener('click', updateDevice);
    document.getElementById('delete-device-btn').addEventListener('click', deleteDevice);
});