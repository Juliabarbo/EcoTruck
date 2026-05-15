import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [togglingUserId, setTogglingUserId] = useState(null);

  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredUsers = normalizedSearch
    ? users.filter((user) => {
        const name = user.name?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const id = String(user.id || '').toLowerCase();

        return name.includes(normalizedSearch)
          || email.includes(normalizedSearch)
          || id.includes(normalizedSearch);
      })
    : users;

  useFocusEffect(
    useCallback(() => {
      async function loadUsers() {
        setErrorMessage('');
        setIsLoading(true);

        try {
          const [usersResponse, tripsResponse] = await Promise.all([
            api.get('/users/'),
            api.get('/trips'),
          ]);

          setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
          setTrips(Array.isArray(tripsResponse.data) ? tripsResponse.data : []);
        } catch (error) {
          setErrorMessage('Não foi possível carregar os usuários.');
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

  function formatDate(value) {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function getUserTrips(user) {
    const userName = user.name?.trim().toLowerCase();

    if (!userName) {
      return [];
    }

    return trips.filter((trip) => trip.driverName?.trim().toLowerCase() === userName);
  }

  function getUserStats(user) {
    const userTrips = getUserTrips(user);
    const totalWeight = userTrips.reduce((total, trip) => {
      const weight = Number(trip.estimatedWeight);
      return Number.isNaN(weight) ? total : total + weight;
    }, 0);

    return {
      tripsCount: userTrips.length,
      totalWeight,
    };
  }

  function formatWeight(value) {
    if (!value) {
      return '0 ton';
    }

    return `${Number(value.toFixed(2))} ton`;
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
    const stats = getUserStats(item);
    const createdAt = formatDate(item.createdAt);

    return (
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <View style={styles.userTitleArea}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userId}>ID {item.id}</Text>
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

          <View style={styles.statsArea}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Viagens</Text>
              <Text style={styles.statValue}>{stats.tripsCount}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total transportado</Text>
              <Text style={styles.statValue}>{formatWeight(stats.totalWeight)}</Text>
            </View>

            {createdAt ? (
              <View style={styles.createdArea}>
                <Text style={styles.createdLabel}>Cadastro</Text>
                <Text style={styles.createdValue}>{createdAt}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  function renderSearch() {
    return (
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar motorista por nome, ID ou e-mail..."
          placeholderTextColor="#64748b"
        />
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
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTextArea}>
            <Text style={styles.title}>Gerenciar Usuários</Text>
            <Text style={styles.subtitle}>Usuários cadastrados</Text>
          </View>

          <TouchableOpacity
            style={styles.addIconButton}
            onPress={() => navigation.navigate('AddDriver')}
            activeOpacity={0.8}
          >
            <UserPlus size={22} color="#FFFFFF" />
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
          <UserPlus size={20} color="#FFFFFF" />
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
        data={filteredUsers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderSearch}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum motorista encontrado</Text>
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
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  headerTextArea: {
    flex: 1,
  },
  addIconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginLeft: 12,
    width: 36,
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
  searchContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: '#0f172a',
    flex: 1,
    fontSize: 14,
    height: 44,
  },
  footer: {
    paddingTop: 4,
  },
  addDriverButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
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
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 18,
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
    marginBottom: 12,
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
  userId: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 7,
  },
  userEmail: {
    color: '#334155',
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
  statsArea: {
    alignItems: 'flex-end',
    borderTopColor: '#f1f5f9',
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 14,
  },
  statItem: {
    marginRight: 18,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  createdArea: {
    alignItems: 'flex-end',
    flex: 1,
  },
  createdLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
  },
  createdValue: {
    color: '#0f172a',
    fontSize: 13,
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
