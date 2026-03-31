import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'finpal_refresh_token';

/**
 * Refresh token storage: Keychain/Keystore on native; AsyncStorage on web
 * (expo-secure-store has no working web implementation for these APIs).
 */
export async function setRefreshToken(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, value);
}

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function deleteRefreshToken(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
