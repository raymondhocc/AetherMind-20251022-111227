// A simple mock authentication service using localStorage.
// In a real application, this would be replaced with actual API calls to a backend.
const USERS_KEY = 'aethermind_users';
const SESSION_KEY = 'aethermind_session';
// Simple hashing function for demonstration purposes.
// DO NOT use this in production. Use a proper hashing library like bcrypt.
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
const getUsers = (): Record<string, { hashedPassword: string }> => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  } catch (error) {
    console.error("Failed to parse users from localStorage", error);
    return {};
  }
};
const saveUsers = (users: Record<string, { hashedPassword: string }>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
export const signup = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
  const users = getUsers();
  if (users[username]) {
    return { success: false, error: 'User already exists.' };
  }
  const hashedPassword = await hashPassword(password);
  users[username] = { hashedPassword };
  saveUsers(users);
  return { success: true };
};
export const login = async (username: string, password: string): Promise<{ success: boolean; user?: { username: string }; error?: string }> => {
  const users = getUsers();
  const user = users[username];
  if (!user) {
    return { success: false, error: 'Invalid username or password.' };
  }
  const hashedPassword = await hashPassword(password);
  if (user.hashedPassword !== hashedPassword) {
    return { success: false, error: 'Invalid username or password.' };
  }
  // Create a mock session token
  const sessionToken = btoa(JSON.stringify({ username, expires: Date.now() + 86400000 })); // 24-hour session
  localStorage.setItem(SESSION_KEY, sessionToken);
  return { success: true, user: { username } };
};
export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};
export const getCurrentUser = (): { username: string } | null => {
  try {
    const sessionToken = localStorage.getItem(SESSION_KEY);
    if (!sessionToken) return null;
    const session = JSON.parse(atob(sessionToken));
    if (session.expires < Date.now()) {
      logout();
      return null;
    }
    return { username: session.username };
  } catch (error) {
    console.error("Failed to get current user", error);
    logout();
    return null;
  }
};