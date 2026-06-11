import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useColors } from '../../theme';
import { setUser, setTokens } from '../../store/slices/authSlice';
import { Config } from '../../config';

export default function LoginScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${Config.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Giriş başarısız. E-posta veya şifre hatalı olabilir.');
      }

      dispatch(setUser(data.user));
      dispatch(setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }));
    } catch (err: any) {
      setError(err.message || 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>HisseAI</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Portföyünüzü ve yapay zeka analizlerinizi yönetmek için giriş yapın.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>E-posta</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border }
              ]}
              placeholder="E-posta adresiniz"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Şifre</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border }
              ]}
              placeholder="Şifreniz"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>
              Hesabınız yok mu?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>
                Kayıt Olun
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 15,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
});
