import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { baseUrl } from '../config/api';
// import {
//   User,
// } from 'firebase/auth';
// import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
// import { supabase } from '@/config/superbaseInit';
// import { auth, } from '@/config/firebase';

export type UserType = "client" | "farmer";

export interface IUser {
  id?: string;
  userName: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  type: UserType;
  location?: string;
}

interface AuthStore {
	user: IUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (user: IUser, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const useAuthStore = create(
	persist<AuthStore>(
		(set) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			login: async (email: string, password: string) => {
				try {
					// set({ isLoading: true, error: null });

					const response = await axios.post(`${baseUrl}/api/users/login`, {
						email,
						password,
					});
					const { user, token } = response.data;

					if (user && token) {
						// Store token in localStorage or cookies
						// localStorage.setItem('authToken', token);
						axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

						console.log(user);

						set({
							user: {
								id: user?.id,
								userName: user.userName,
								email: user.email,
								type: user.type,
								location: user.location,
							},
							isAuthenticated: true,
							// isLoading: false,
						});

						return user;
					}

					throw new Error("Login failed: No user data received");
				} catch (error: any) {
					let message = "Login failed";

					if (error.response) {
						// Handle API response errors
						switch (error.response.status) {
							case 400:
								message = "Invalid request";
								break;
							case 401:
								message = "Invalid email or password";
								break;
							case 404:
								message = "User not found";
								break;
							default:
								message = error.response.data?.message || "Login failed";
						}
					} else if (error.request) {
						message = "No response from server";
					} else {
						message = error.message || "Login failed";
					}

					set({
						error: message,
						isLoading: false,
					});

					throw new Error(message);
				}
			},

			register: async (userData, password) => {
				console.log("Registration payload:", userData);

				if (!userData.email) {
					set({ error: "Email is required", isLoading: false });
					throw new Error("Email is required");
				}

				if (!password || password.length < 6) {
					set({
						error: "Password should be at least 6 characters",
						isLoading: false,
					});
					throw new Error("Password should be at least 6 characters");
				}

				try {
					set({ isLoading: true, error: null });

					const response = await axios.post(`${baseUrl}/api/users/register`, {
						...userData,
						password,
					});

					if (response.status !== 201) {
						throw new Error("Registration failed");
					}

					console.log("registeration success", response.data.user);

					set({
						user: response.data.user,
						isAuthenticated: true,
						isLoading: false,
						error: null,
					});
				} catch (error: any) {
					let errorMessage = "Registration failed";

					if (axios.isAxiosError(error)) {
						errorMessage =
							error.response?.data?.message ||
							"Network error during registration";
					} else if (error.message) {
						switch (error.message) {
							case "User already exists":
								errorMessage = "Email already registered";
								break;
							case "Password is too short":
								errorMessage = "Password should be at least 6 characters";
								break;
							default:
								errorMessage = error.message;
						}
					}

					console.error("Registration error:", error);

					set({
						error: errorMessage,
						isAuthenticated: false,
						isLoading: false,
						user: null,
					});

					// Rethrow for caller to handle if needed
					throw new Error(errorMessage);
				}
			},

			logout: async () => {
				try {
					set({ isLoading: true, error: null });
					set({ user: null, isAuthenticated: false, isLoading: false });
				} catch (error: any) {
					set({ error: error.message || "Logout failed", isLoading: false });
					throw new Error(error.message || "Logout failed");
				}
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);

export default useAuthStore;