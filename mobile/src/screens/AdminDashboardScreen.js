import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

export default function AdminDashboardScreen({ navigation }) {
  const [adminName, setAdminName] = useState('Administrador');
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setErrorMessage('');
      setIsLoading(true);

      try {
        const storedName = await AsyncStorage.getItem('@ecotruck/userName');
        setAdminName(storedName || 'Administrador');

        const response = await api.get('/trips');
        setTrips(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setErrorMessage('Nao foi possivel carregar as viagens.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  async function handleLogout() {
    await AsyncStorage.multiRemove([
      '@ecotruck/token',
      '@ecotruck/userName',
      '@ecotruck/userEmail',
      '@ecotruck/userRole',
    ]);
    navigation.replace('Login');
  }

  function formatStatus(status) {
    if (status === 'COMPLETED') {
      return 'Concluida';
    }

    if (status === 'IN_PROGRESS') {
      return 'Em andamento';
    }

    if (status === 'PENDING') {
      return 'Pendente';
    }

    return status || 'Sem status';
  }

  function renderTrip({ item }) {
    return (
      <View style={styles.tripCard}>
        <Text style={styles.tripLabel}>Origem</Text>
        <Text style={styles.tripValue}>{item.origin}</Text>

        <Text style={styles.tripLabel}>Destino</Text>
        <Text style={styles.tripValue}>{item.destination}</Text>

        <Text style={styles.tripStatus}>{formatStatus(item.status)}</Text>
      </View>
    );
  }

  const totalTrips = trips.length;
  const inProgressTrips = trips.filter((trip) => trip.status === 'IN_PROGRESS').length;
  const completedTrips = trips.filter((trip) => trip.status === 'COMPLETED').length;
  const pendingTrips = trips.filter((trip) => trip.status === 'PENDING').length;

  function renderHeader() {
    return (
      <View>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextArea}>
              <Text style={styles.title}>Painel do Administrador</Text>
              <Text style={styles.subtitle}>{adminName}</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>

        

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.blueIcon]}>
                <Text style={styles.metricIconText}>T</Text>
              </View>
              <Text style={styles.metricValue}>{totalTrips}</Text>
              <Text style={styles.metricLabel}>Total de viagens</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.yellowIcon]}>
                <Text style={styles.metricIconText}>A</Text>
              </View>
              <Text style={styles.metricValue}>{inProgressTrips}</Text>
              <Text style={styles.metricLabel}>Em andamento</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.greenIcon]}>
                <Text style={styles.metricIconText}>C</Text>
              </View>
              <Text style={styles.metricValue}>{completedTrips}</Text>
              <Text style={styles.metricLabel}>Concluidas</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.grayIcon]}>
                <Text style={styles.metricIconText}>P</Text>
              </View>
              <Text style={styles.metricValue}>{pendingTrips}</Text>
              <Text style={styles.metricLabel}>Pendentes</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Acesso Rapido</Text>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.8}>
              <View style={[styles.quickActionIcon, styles.quickActionBlueIcon]}>
                <Text style={[styles.quickActionIconText, styles.quickActionBlueText]}>V</Text>
              </View>
              <Text style={styles.quickActionText}>Viagens</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('UserManagement')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, styles.quickActionGreenIcon]}>
                <Text style={[styles.quickActionIconText, styles.quickActionGreenText]}>U</Text>
              </View>
              <Text style={styles.quickActionText}>Usuarios</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Viagens</Text>
          <Text style={styles.sectionSubtitle}>Monitoramento geral</Text>
        </View>
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
      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTrip}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhuma viagem encontrada</Text>
            <Text style={styles.emptyText}>As viagens da empresa aparecerao aqui.</Text>
          </View>
        }
      />
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
    marginBottom: 24,
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
  logoutButton: {
    borderColor: '#6b7280',
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
  quickActionsSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  quickActionsTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  quickActionIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 8,
    width: 48,
  },
  quickActionBlueIcon: {
    backgroundColor: '#dbeafe',
  },
  quickActionGreenIcon: {
    backgroundColor: '#dcfce7',
  },
  quickActionIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  quickActionBlueText: {
    color: '#2563eb',
  },
  quickActionGreenText: {
    color: '#16a34a',
  },
  quickActionText: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 14,
    width: '47%',
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    marginBottom: 10,
    width: 36,
  },
  blueIcon: {
    backgroundColor: '#3b82f6',
  },
  yellowIcon: {
    backgroundColor: '#eab308',
  },
  greenIcon: {
    backgroundColor: '#16a34a',
  },
  grayIcon: {
    backgroundColor: '#6b7280',
  },
  metricIconText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#d1d5db',
    fontSize: 12,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionSubtitle: {
    color: '#6b7280',
    fontSize: 13,
  },
  list: {
    paddingBottom: 32,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 24,
    marginTop: 12,
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
    marginHorizontal: 24,
    marginTop: 12,
    padding: 24,
  },
  emptyTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
});
