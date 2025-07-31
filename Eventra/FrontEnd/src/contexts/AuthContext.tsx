
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role:
    | 'student'
    | 'faculty'
    | 'service-provider'
    | 'super-admin'
    | 'vice-chancellor'
    | 'administration'
    | 'student-union'
    | 'warden';
  serviceType?: 'Sound System' | 'Media'; // Only for service-provider
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define role categories
const PUBLIC_ROLES = ['student', 'faculty'];
const AUTHORITY_ROLES = ['super-admin', 'service-provider', 'vice-chancellor', 'administration', 'student-union', 'warden'];

// Mock users for demo - Pre-created authority accounts
const mockUsers: User[] = [
  // Authority Roles (Admin-Created Accounts)
  { id: '1', name: 'Super Administrator', email: 'superadmin@university.edu', role: 'super-admin' },
  { id: '2', name: 'Sound Pro', email: 'soundpro@university.edu', role: 'service-provider', serviceType: 'Sound System' },
  { id: '3', name: 'UvaRayon Media', email: 'uvarayonmedia@university.edu', role: 'service-provider', serviceType: 'Media' },
  { id: '4', name: 'Vice Chancellor', email: 'vicechancellor@university.edu', role: 'vice-chancellor' },
  { id: '5', name: 'Administration of UWU', email: 'administrationuwu@university.edu', role: 'administration' },
  { id: '6', name: 'Student Union', email: 'studentunion@university.edu', role: 'student-union' },
  { id: '7', name: 'Warden', email: 'warden@university.edu', role: 'warden' },
  
  // Public Roles (Can be created through registration)
  { id: '8', name: 'Amal', email: 'amal@university.edu', role: 'student' },
  { id: '9', name: 'FAS', email: 'fas@university.edu', role: 'faculty' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('eventra_user');
    console.log('Checking stored user:', storedUser);
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('Found stored user:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('eventra_user');
      }
    }
  }, []);

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    console.log('AuthContext: Login attempt for:', { email, role, password: password ? 'provided' : 'missing' });
    console.log('Available mock users:', mockUsers);
    
    // Mock authentication - in real app, this would be an API call
    let foundUser = mockUsers.find(u => {
      console.log('Checking user:', u.email, 'against:', email, 'role:', u.role, 'against:', role);
      return u.email === email && u.role === role;
    });
    
    // If registering a new service provider, assign a default serviceType if not present
    if (foundUser && foundUser.role === 'service-provider' && !foundUser.serviceType) {
      foundUser = { ...foundUser, serviceType: 'Sound System' };
    }
    
    console.log('Found user:', foundUser);
    
    // Use consistent demo password for all accounts
    if (foundUser && password === 'password123') {
      console.log('Authentication successful');
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('eventra_user', JSON.stringify(foundUser));
      return true;
    }
    
    console.log('Authentication failed');
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    console.log('AuthContext: Registration attempt for:', userData);
    
    // Check if the role is allowed for public registration
    if (!PUBLIC_ROLES.includes(userData.role as any)) {
      console.error('Registration failed: Role not allowed for public registration');
      throw new Error('This role cannot be registered publicly. Please contact your administrator.');
    }
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      console.error('Registration failed: User already exists');
      throw new Error('An account with this email already exists.');
    }
    
    // Mock registration - in real app, this would be an API call
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role as User['role'],
    };
    
    // Add to mock users (in real app, this would be saved to database)
    mockUsers.push(newUser);
    console.log('User registered successfully:', newUser);
    
    // Automatically log in the user after successful registration
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('eventra_user', JSON.stringify(newUser));
    
    return true;
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('eventra_user');
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
