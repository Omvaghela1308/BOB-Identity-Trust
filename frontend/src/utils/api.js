const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Send an OTP to the provided email.
 */
export async function sendOtp(email) {
  const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

/**
 * Verify OTP code for user login.
 */
export async function verifyOtp(email, otp) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Verification failed');
  }
  return response.json();
}

/**
 * Log in a user using email and password.
 */
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  return response.json();
}

/**
 * Simulate a specific security risk vector.
 */
export async function simulateRisk(riskVector) {
  const response = await fetch(`${API_BASE_URL}/risk/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ riskVector }),
  });
  return response.json();
}

/**
 * Initiate a transfer request.
 */
export async function transferFunds(email, amount, recipient) {
  const response = await fetch(`${API_BASE_URL}/transaction/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amount, recipient }),
  });
  return response.json();
}

/**
 * Verify step-up secondary OTP for a high-risk transfer.
 */
export async function verifyStepUp(email, password, amount, recipient) {
  const response = await fetch(`${API_BASE_URL}/transaction/verify-stepup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, amount, recipient }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'MFA password verification failed');
  }
  return response.json();
}

/**
 * Fetch cybersecurity operations console logs and metrics.
 */
export async function getAdminMetrics() {
  const response = await fetch(`${API_BASE_URL}/admin/metrics`);
  return response.json();
}

/**
 * Fetch all registered users, their profile details, transaction history, and chart data.
 */
export async function getAdminUsersSummary(token) {
  const response = await fetch(`${API_BASE_URL}/admin/users-summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch admin users summary');
  }
  return response.json();
}

/**
 * Register a new corporate identity.
 */
export async function registerUser(username, email, phone, aadhaar, password) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      phone,
      aadhaar,
      password,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  return response.json();
}
