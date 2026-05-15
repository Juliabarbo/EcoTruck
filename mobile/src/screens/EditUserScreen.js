import { useState } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

export default function EditUserScreen({ navigation, route }) {
  const user = route.params?.user || {};
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    setIsLoading(true);

    try {
      await api.patch(`/users/${user.id}`, {
        name,
        email,
      });
      navigation.navigate('UserManagement');
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await api.delete(`/users/${user.id}`);
      navigation.navigate('UserManagement');
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('UserManagement')}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTextArea}>
            <Text style={styles.title}>Editar Usuário</Text>
            <Text style={styles.subtitle}>Atualizar informações do usuário</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informações principais</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do usuário"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados do perfil</Text>

          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>Role</Text>
            <Text style={styles.readOnlyValue}>{user.role || '-'}</Text>
          </View>

          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>Status</Text>
            <Text style={user.active ? styles.activeText : styles.inactiveText}>
              {user.active ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isLoading || isDeleting}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View style={styles.buttonContent}>
              <Save size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Salvar alterações</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, styles.cancelButton]}
            onPress={() => navigation.navigate('UserManagement')}
            activeOpacity={0.8}
            disabled={isLoading || isDeleting}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, styles.deleteButton]}
            onPress={handleDelete}
            activeOpacity={0.8}
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#dc2626" />
            ) : (
              <View style={styles.buttonContent}>
                <Trash2 size={18} color="#E53935" />
                <Text style={styles.deleteButtonText}>Excluir Motorista</Text>
              </View>
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
    backgroundColor: '#1f2937',
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  headerTextArea: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  readOnlyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  readOnlyLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  readOnlyValue: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '700',
  },
  activeText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '700',
  },
  inactiveText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  cancelButton: {
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    borderColor: '#fca5a5',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
