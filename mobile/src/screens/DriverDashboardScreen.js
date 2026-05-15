import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { CircleCheck, Clock, LogOut, Truck } from 'lucide-react-native';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

export default function DriverDashboardScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [tripsError, setTripsError] = useState('');
  const [driverName, setDriverName] = useState('Motorista');
  const [activeTab, setActiveTab] = useState('ACTIVE');

  useFocusEffect(
    useCallback(() => {
      async function loadUser() {
        const storedName = await AsyncStorage.getItem('@ecotruck/userName');
        setDriverName(storedName || 'Motorista');
      }

      async function loadTrips() {
        setTripsError('');
        setIsLoadingTrips(true);

        try {
          const response = await api.get('/trips');
          const loadedTrips = Array.isArray(response.data) ? response.data : [];
          setTrips(loadedTrips);
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            navigation.replace('Login');
            return;
          }

          setTripsError('Não foi possível carregar as viagens.');
        } finally {
          setIsLoadingTrips(false);
        }
      }

      loadUser();
      loadTrips();
    }, [navigation])
  );

  async function handleLogout() {
    await AsyncStorage.multiRemove([
      '@ecotruck/token',
      '@ecotruck/userName',
      '@ecotruck/userEmail',
      '@ecotruck/userRole',
    ]);
    navigation.replace('Login');
  }

  function normalizeStatus(status) {
    return String(status || '').trim().toUpperCase();
  }

  function renderTrip({ item }) {
    const status = normalizeStatus(item.status);
    const material = formatMaterial(item.materialType);
    const date = formatDateTime(status === 'COMPLETED' ? item.completedAt : item.startedAt);
    const weight = formatWeight(item.estimatedWeight);
    const isInProgress = status === 'IN_PROGRESS';
    const isPending = status === 'PENDING';

    return (
      <View style={[styles.tripCard, (isInProgress || isPending) && styles.inProgressTripCard]}>
        <View style={styles.tripHeader}>
          <View>
            <Text style={styles.tripTitle}>Viagem #{item.id}</Text>
            {date ? <Text style={styles.tripDate}>{date}</Text> : null}
          </View>

          <View style={styles.tripMeta}>
            {weight ? <Text style={styles.tripWeight}>{weight}</Text> : null}
            <View style={[
              styles.tripStatusBadge,
              isInProgress ? styles.inProgressBadge : isPending ? styles.pendingBadge : styles.completedBadge,
            ]}>
              <Text style={[
                styles.tripStatusText,
                isInProgress ? styles.inProgressText : isPending ? styles.pendingText : styles.completedText,
              ]}>
                {isInProgress ? 'Em andamento' : isPending ? 'Pendente' : 'Concluída'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.routeArea}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.originDot]} />
            <View style={styles.routeTextArea}>
              <Text style={styles.tripLabel}>Origem</Text>
              <Text style={styles.tripValue}>{item.origin || 'Sem origem'}</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.destinationDot]} />
            <View style={styles.routeTextArea}>
              <Text style={styles.tripLabel}>Destino</Text>
              <Text style={styles.tripValue}>{item.destination || 'Sem destino'}</Text>
            </View>
          </View>
        </View>

        {material ? (
          <View style={styles.tripFooter}>
            <Text style={styles.materialText}>{material}</Text>
          </View>
        ) : null}

        {(isInProgress || isPending) ? (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => navigation.navigate('ConfirmDisposal', { trip: item })}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Confirmar Descarte</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  function formatMaterial(materialType) {
    const labels = {
      ENTULHO: 'Entulho',
      CONCRETO: 'Concreto',
      MADEIRA: 'Madeira',
      METAL: 'Metal',
      PLASTICO: 'Plástico',
      MISTO: 'Misto',
    };

    return labels[materialType] || materialType || '';
  }

  function formatWeight(weight) {
    if (weight === null || weight === undefined) {
      return '';
    }

    return `${weight} ton`;
  }

  function formatDateTime(value) {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  }

  const completedTrips = trips.filter((trip) => normalizeStatus(trip.status) === 'COMPLETED').length;
  const activeTrips = trips.filter((trip) => {
    const status = normalizeStatus(trip.status);
    return status === 'PENDING' || status === 'IN_PROGRESS';
  });
  const inProgressTrips = activeTrips.length;
  const displayedTrips = activeTab === 'ACTIVE'
    ? activeTrips
    : trips.filter((trip) => normalizeStatus(trip.status) === 'COMPLETED');
  const emptyMessage = activeTab === 'ACTIVE'
    ? 'Nenhuma viagem em andamento'
    : 'Nenhuma viagem concluída';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>M</Text>
            </View>

            <View>
              <Text style={styles.greeting}>Bem-vindo,</Text>
              <Text style={styles.driverName}>{driverName}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <LogOut size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.greenIcon]}>
              <Truck size={24} color="#2E7D32" />
            </View>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Viagens</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.blueIcon]}>
              <Clock size={24} color="#1976D2" />
            </View>
            <Text style={styles.statValue}>{inProgressTrips}</Text>
            <Text style={styles.statLabel}>Em Andamento</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.grayIcon]}>
              <CircleCheck size={24} color="#464749" />
            </View>
            <Text style={styles.statValue}>{completedTrips}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.newTripButton}
            onPress={() => navigation.navigate('NewTrip')}
            activeOpacity={0.8}
          >
            <View style={styles.newTripIcon}>
              <Text style={styles.newTripIconText}>+</Text>
            </View>
            <Text style={styles.newTripText}>Nova Viagem</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('TripHistory')}
            activeOpacity={0.8}
          >
            <Text style={styles.historyButtonText}>Histórico de viagens</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'ACTIVE' && styles.tabButtonActive]}
            onPress={() => setActiveTab('ACTIVE')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.tabTextActive]}>
              Viagens em Andamento
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'COMPLETED' && styles.tabButtonActive]}
            onPress={() => setActiveTab('COMPLETED')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'COMPLETED' && styles.tabTextActive]}>
              Últimas Viagens
            </Text>
          </TouchableOpacity>
        </View>

        {isLoadingTrips ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color="#16a34a" />
          </View>
        ) : tripsError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.errorText}>{tripsError}</Text>
          </View>
        ) : displayedTrips.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              {activeTab === 'ACTIVE' ? (
                <stickyNoteOff  size={42} color="#9E9E9E" />
              ) : (
                <Text style={styles.emptyIconText}>C</Text>
              )}
            </View>
            <Text style={styles.emptyTitle}>{emptyMessage}</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'ACTIVE'
                ? 'Quando houver uma viagem ativa, ela aparecerá aqui.'
                : 'Suas viagens concluídas aparecerão aqui.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedTrips}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderTrip}
            scrollEnabled={false}
          />
        )}
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
    backgroundColor: '#16a34a',
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  profileInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  avatarText: {
    color: '#16a34a',
    fontSize: 20,
    fontWeight: '700',
  },
  greeting: {
    color: '#f0fdf4',
    fontSize: 14,
    marginBottom: 2,
  },
  driverName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flex: 1,
    minHeight: 104,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginBottom: 6,
    width: 28,
  },
  greenIcon: {
    backgroundColor: '#dcfce7',
  },
  blueIcon: {
    backgroundColor: '#dbeafe',
  },
  grayIcon: {
    backgroundColor: '#f3f4f6',
  },
  statValue: {
    color: '#1f2937',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: '#4b5563',
    fontSize: 11,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  newTripButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#16a34a',
    borderRadius: 8,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  newTripIcon: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginBottom: 6,
    width: 32,
  },
  newTripIconText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  newTripText: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  historyButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    flex: 1,
    minHeight: 72,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  historyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabsContainer: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    paddingBottom: 12,
  },
  tabButtonActive: {
    borderBottomColor: '#16a34a',
    borderBottomWidth: 2,
  },
  tabText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#16a34a',
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 14,
    width: 56,
  },
  emptyIconText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  inProgressTripCard: {
    borderLeftColor: '#2563eb',
    borderLeftWidth: 4,
  },
  tripHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tripTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  tripDate: {
    color: '#6b7280',
    fontSize: 12,
  },
  tripMeta: {
    alignItems: 'flex-end',
  },
  tripWeight: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
  },
  tripStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inProgressBadge: {
    backgroundColor: '#dbeafe',
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#ffedd5',
  },
  tripStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inProgressText: {
    color: '#2563eb',
  },
  completedText: {
    color: '#16a34a',
  },
  pendingText: {
    color: '#f97316',
  },
  routeArea: {
    gap: 12,
    marginBottom: 14,
  },
  routeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  routeDot: {
    borderRadius: 6,
    height: 12,
    marginRight: 10,
    marginTop: 4,
    width: 12,
  },
  originDot: {
    backgroundColor: '#16a34a',
  },
  destinationDot: {
    backgroundColor: '#dc2626',
  },
  routeTextArea: {
    flex: 1,
  },
  tripLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  tripValue: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
  tripFooter: {
    borderTopColor: '#f3f4f6',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  materialText: {
    color: '#6b7280',
    fontSize: 12,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    marginTop: 14,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
