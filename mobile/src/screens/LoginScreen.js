import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setErrorMessage('');
    setIsLoading(true);

    try {
      await AsyncStorage.multiRemove([
        '@ecotruck/token',
        '@ecotruck/userName',
        '@ecotruck/userEmail',
        '@ecotruck/userRole',
      ]);

      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const token = response.data?.token;
      const userName = response.data?.name;
      const userEmail = response.data?.email;
      const userRole = response.data?.role;

      if (!token) {
        setErrorMessage('Token nao recebido pelo servidor.');
        return;
      }

      if (userRole !== 'DRIVER' && userRole !== 'ADMIN') {
        setErrorMessage('Perfil de usuario nao permitido.');
        return;
      }

      await AsyncStorage.multiSet([
        ['@ecotruck/token', token],
        ['@ecotruck/userName', userName || 'Motorista'],
        ['@ecotruck/userEmail', userEmail || email],
        ['@ecotruck/userRole', userRole],
      ]);

      navigation.replace(userRole === 'ADMIN' ? 'AdminDashboard' : 'Dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'E-mail ou senha invalidos.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>ET</Text>
        </View>
        <Text style={styles.title}>EcoTruck</Text>
        <Text style={styles.subtitle}>Gestao Inteligente de Residuos</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.formTitle}>Entre na sua conta</Text>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua senha"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 56,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginBottom: 16,
    width: 72,
  },
  logoText: {
    color: '#16a34a',
    fontSize: 22,
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#f0fdf4',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  form: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
  },
  formTitle: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    height: 48,
    paddingHorizontal: 14,
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
