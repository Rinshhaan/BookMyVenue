import api from './api.js'

// Save user session to localStorage
function saveSession(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

// Get current logged in user
export function getUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Get JWT token
export function getToken() {
  return localStorage.getItem('token')
}

// Check if logged in
export function isLoggedIn() {
  return !!localStorage.getItem('token')
}

// Logout
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/'
}

// Signup API call
export async function signup(data) {
  const res = await api.post('/auth/signup', data)
  saveSession(res.data.token, res.data.user)
  return res.data
}

// Login API call
export async function login(data) {
  const res = await api.post('/auth/login', data)
  saveSession(res.data.token, res.data.user)
  return res.data
}

// Get current user from backend
export async function fetchMe() {
  const res = await api.get('/auth/me')
  return res.data.user
}   