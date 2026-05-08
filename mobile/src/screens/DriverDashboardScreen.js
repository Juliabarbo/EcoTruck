import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

export default function DriverDashboardScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [tripsError, setTripsError] = useState('');
  const [driverName, setDriverName] = useState('Motorista');

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
          setTrips(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            navigation.replace('Login');
            return;
          }

          setTripsError('Nao foi possivel carregar as viagens.');
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

  function renderTrip({ item }) {
    return (
      <View style={styles.tripCard}>
        <Text style={styles.tripLabel}>Origem</Text>
        <Text style={styles.tripValue}>{item.origin}</Text>
        <Text style={styles.tripLabel}>Destino</Text>
        <Text style={styles.tripValue}>{item.destination}</Text>
        <Text style={styles.tripStatus}>{item.status}</Text>
      </View>
    );
  }

  const completedTrips = trips.filter((trip) => trip.status === 'COMPLETED').length;
  const inProgressTrips = trips.filter((trip) => trip.status === 'IN_PROGRESS').length;

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
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.greenIcon]}>
              <Text style={[styles.statIconText, styles.greenIconText]}>V</Text>
            </View>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Viagens</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.blueIcon]}>
              <Text style={[styles.statIconText, styles.blueIconText]}>A</Text>
            </View>
            <Text style={styles.statValue}>{inProgressTrips}</Text>
            <Text style={styles.statLabel}>Em Andamento</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.grayIcon]}>
              <Text style={[styles.statIconText, styles.grayIconText]}>C</Text>
            </View>
            <Text style={styles.statValue}>{completedTrips}</Text>
            <Text style={styles.statLabel}>Concluidas</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
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
          <Text style={styles.historyButtonText}>Historico de viagens</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Viagens</Text>

        {isLoadingTrips ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color="#16a34a" />
          </View>
        ) : tripsError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.errorText}>{tripsError}</Text>
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>ET</Text>
            </View>
            <Text style={styles.emptyTitle}>Nenhuma viagem encontrada</Text>
            <Text style={styles.emptyText}>
              Nao ha dados de viagem disponiveis para exibir no momento.
            </Text>
          </View>
        ) : (
          <FlatList
            data={trips}
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
    borderColor: '#bbf7d0',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  statIconText: {
    fontSize: 13,
    fontWeight: '700',
  },
  greenIconText: {
    color: '#16a34a',
  },
  blueIconText: {
    color: '#2563eb',
  },
  grayIconText: {
    color: '#4b5563',
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
  newTripButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#16a34a',
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
  },
  newTripIcon: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 8,
    width: 48,
  },
  newTripIconText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 30,
  },
  newTripText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  historyButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginBottom: 24,
  },
  historyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
  tripLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  tripValue: {
    color: '#111827',
    fontSize: 15,
    marginBottom: 10,
  },
  tripStatus: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
});
