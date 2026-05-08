import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [togglingUserId, setTogglingUserId] = useState(null);

  useFocusEffect(
    useCallback(() => {
    async function loadUsers() {
      setErrorMessage('');
      setIsLoading(true);

      try {
        const response = await api.get('/users/');
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setErrorMessage('Nao foi possivel carregar os usuarios.');
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
    }, [])
  );

  function getInitials(name) {
    if (!name) {
      return 'U';
    }

    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async function handleToggleUser(user) {
    if (!user) {
      return;
    }

    setTogglingUserId(user.id);

    try {
      const response = await api.patch(`/users/${user.id}/toggle`);
      const updatedUser = response.data;

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser
        )
      );
      setSelectedUser(null);
    } catch (error) {
      console.log(error);
    } finally {
      setTogglingUserId(null);
    }
  }

  function renderUser({ item }) {
    return (
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <View style={styles.userTitleArea}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>

            <View style={styles.userActions}>
              <View style={[styles.statusBadge, item.active ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={[styles.statusText, item.active ? styles.activeText : styles.inactiveText]}>
                  {item.active ? 'Ativo' : 'Inativo'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setSelectedUser(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.menuButtonText}>⋮</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
        </View>
      </View>
    );
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('AdminDashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerTextArea}>
            <Text style={styles.title}>Gerenciar Usuarios</Text>
            <Text style={styles.subtitle}>Usuarios cadastrados</Text>
          </View>

          <TouchableOpacity
            style={styles.addIconButton}
            onPress={() => navigation.navigate('AddDriver')}
            activeOpacity={0.8}
          >
            <Text style={styles.addIconButtonText}>U+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderFooter() {
    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addDriverButton}
          onPress={() => navigation.navigate('AddDriver')}
          activeOpacity={0.8}
        >
          <Text style={styles.addDriverIcon}>+</Text>
          <Text style={styles.addDriverText}>Adicionar Novo Motorista</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.center}>
          <ActivityIndicator color="#16a34a" />
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.center}>
          <Text style={styles.error}>{errorMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum usuario encontrado</Text>
          </View>
        }
      />

      <Modal
        visible={Boolean(selectedUser)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={() => setSelectedUser(null)}
          activeOpacity={1}
        >
          <TouchableOpacity style={styles.menuContent} activeOpacity={1}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const userToEdit = selectedUser;
                setSelectedUser(null);
                navigation.navigate('EditUser', { user: userToEdit });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.menuItemText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => setSelectedUser(null)} activeOpacity={0.8}>
              <Text style={styles.menuItemText}>Ver viagens</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleToggleUser(selectedUser)}
              activeOpacity={0.8}
              disabled={togglingUserId === selectedUser?.id}
            >
              {togglingUserId === selectedUser?.id ? (
                <ActivityIndicator color="#16a34a" />
              ) : (
                <Text style={styles.menuActionText}>
                  {selectedUser?.active ? 'Inativar' : 'Ativar'}
                </Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    borderColor: '#6b7280',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  headerTextArea: {
    flex: 1,
  },
  addIconButton: {
    alignItems: 'center',
    borderColor: '#6b7280',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    marginLeft: 12,
    width: 40,
  },
  addIconButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
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
  list: {
    padding: 24,
    paddingBottom: 32,
  },
  footer: {
    paddingTop: 4,
  },
  addDriverButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  addDriverIcon: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
    marginRight: 8,
  },
  addDriverText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 10,
  },
  userTitleArea: {
    flex: 1,
    paddingRight: 8,
  },
  userActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  userName: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  userEmail: {
    color: '#6b7280',
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  menuButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  menuButtonText: {
    color: '#4b5563',
    fontSize: 22,
    fontWeight: '700',
  },
  activeText: {
    color: '#16a34a',
  },
  inactiveText: {
    color: '#dc2626',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    padding: 24,
  },
  emptyTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  menuOverlay: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 150,
  },
  menuContent: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 4,
    minWidth: 160,
    paddingVertical: 6,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  menuActionText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
