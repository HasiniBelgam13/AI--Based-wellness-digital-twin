/**
 * Storage Service for WellNest
 * Manages localStorage persistence for:
 * - Registered accounts and authentication state
 * - User profiles and configurable wellness targets
 * - User check-in history isolated per user
 */

import { DEFAULT_GOALS } from "../utils/scoreCalculator";

const USERS_KEY = "wellnest_users_v1";
const SESSION_KEY = "wellnest_session_v1";
const CHECKINS_PREFIX = "wellnest_checkins_";
const PROFILES_PREFIX = "wellnest_profile_";

export function removeLegacyDemoAccount() {
  const legacyDemoId = "demo_user_1";
  const users = getUsers();
  const remainingUsers = users.filter((user) => user.id !== legacyDemoId);

  if (remainingUsers.length !== users.length) {
    localStorage.setItem(USERS_KEY, JSON.stringify(remainingUsers));
  }

  localStorage.removeItem(PROFILES_PREFIX + legacyDemoId);
  localStorage.removeItem(CHECKINS_PREFIX + legacyDemoId);

  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (session?.id === legacyDemoId) localStorage.removeItem(SESSION_KEY);
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Get all registered accounts.
 */
export function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Register a new user account.
 */
export function registerUser({ name, email, password, profileDetails = {} }) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error("An account with this email already exists. Please log in.");
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: name.trim(),
    email: normalizedEmail,
    password, // Stored locally for prototype only
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Initialize their custom profile
  const userProfile = {
    gender: profileDetails.gender || "Female",
    age: profileDetails.age || 26,
    occupation: profileDetails.occupation || "Software Engineer",
    bmiCategory: profileDetails.bmiCategory || "Normal",
    bloodPressure: profileDetails.bloodPressure || "120/80",
    sleepDisorder: profileDetails.sleepDisorder || "None",
    goals: {
      sleepDuration: profileDetails.sleepGoal || DEFAULT_GOALS.sleepDuration,
      dailySteps: profileDetails.stepGoal || DEFAULT_GOALS.dailySteps,
      physicalActivity: profileDetails.activityGoal || DEFAULT_GOALS.physicalActivity
    }
  };

  localStorage.setItem(PROFILES_PREFIX + newUser.id, JSON.stringify(userProfile));
  localStorage.setItem(CHECKINS_PREFIX + newUser.id, JSON.stringify([]));

  return newUser;
}

/**
 * Login verification.
 */
export function loginUser(email, password) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password. Please verify your credentials.");
  }

  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    loggedInAt: new Date().toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  return sessionData;
}

/**
 * Get current authenticated user session.
 */
export function getCurrentSession() {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

/**
 * Log out user (clears session, preserves records).
 */
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Get user profile and goals.
 */
export function getUserProfile(userId) {
  if (!userId) return null;
  try {
    const data = localStorage.getItem(PROFILES_PREFIX + userId);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Save updated user profile & goals.
 */
export function saveUserProfile(userId, profile) {
  if (!userId) return;
  localStorage.setItem(PROFILES_PREFIX + userId, JSON.stringify(profile));
}

/**
 * Get check-ins for a user, sorted newest first.
 */
export function getUserCheckIns(userId) {
  if (!userId) return [];
  try {
    const data = localStorage.getItem(CHECKINS_PREFIX + userId);
    const checkins = data ? JSON.parse(data) : [];
    // Sort newest date first
    return checkins.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch {
    return [];
  }
}

/**
 * Save or update a check-in entry for a user.
 */
export function saveCheckIn(userId, entryData) {
  if (!userId) throw new Error("No authenticated user.");

  const currentCheckIns = getUserCheckIns(userId);
  const existingIndex = currentCheckIns.findIndex((c) => c.date === entryData.date);

  const newEntry = {
    ...entryData,
    id: existingIndex >= 0 ? currentCheckIns[existingIndex].id : `entry_${Date.now()}`,
    userId,
    updatedAt: new Date().toISOString()
  };

  let updatedList;
  if (existingIndex >= 0) {
    updatedList = [...currentCheckIns];
    updatedList[existingIndex] = newEntry;
  } else {
    updatedList = [newEntry, ...currentCheckIns];
  }

  // Sort newest first
  updatedList.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem(CHECKINS_PREFIX + userId, JSON.stringify(updatedList));

  return newEntry;
}

/**
 * Delete a check-in entry by ID.
 */
export function deleteCheckIn(userId, entryId) {
  if (!userId) return false;
  const currentCheckIns = getUserCheckIns(userId);
  const filtered = currentCheckIns.filter((c) => c.id !== entryId);
  localStorage.setItem(CHECKINS_PREFIX + userId, JSON.stringify(filtered));
  return true;
}
