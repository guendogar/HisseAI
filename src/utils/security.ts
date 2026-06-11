import AsyncStorage from '@react-native-async-storage/async-storage';

// In a real production app, you would use react-native-keychain or react-native-encrypted-storage
// For the sake of this prompt, we are wrapping AsyncStorage to simulate a secure API layer.

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      // simulate encryption
      const encryptedValue = encodeURIComponent(value);
      await AsyncStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('SecureStorage setItem error', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      const encryptedValue = await AsyncStorage.getItem(key);
      if (!encryptedValue) return null;
      // simulate decryption
      return decodeURIComponent(encryptedValue);
    } catch (error) {
      console.error('SecureStorage getItem error', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
};
