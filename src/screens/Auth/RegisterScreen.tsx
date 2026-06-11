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

export default function RegisterScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${Config.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt işlemi başarısız. Bilgilerinizi kontrol edin.');
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
          <Text style={[styles.title, { color: colors.text }]}>Hesap Oluştur</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            HisseAI dünyasına katılın ve piyasaları yapay zeka ile takip edin.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Ad Soyad</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border }
              ]}
              placeholder="Adınız ve Soyadınız"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

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
              placeholder="En az 6 karakter"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Zaten hesabınız var mı?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                Giriş Yapın
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
  registerButton: {
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
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
});
