import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CircleCheck, Clock, LogOut, Route, Truck, Users } from 'lucide-react-native';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

const MATERIAL_LABELS = {
  ENTULHO: 'Entulho',
  CONCRETO: 'Concreto',
  MADEIRA: 'Madeira',
  METAL: 'Metal',
  PLASTICO: 'Plástico',
  MISTO: 'Misto',
};

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
        setErrorMessage('Não foi possível carregar as viagens.');
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
      return 'Concluída';
    }

    if (status === 'IN_PROGRESS') {
      return 'Em andamento';
    }

    if (status === 'PENDING') {
      return 'Pendente';
    }

    return status || 'Sem status';
  }

  function getStatusStyle(status) {
    if (status === 'COMPLETED') {
      return {
        badge: styles.completedBadge,
        text: styles.completedText,
        icon: styles.completedIcon,
      };
    }

    if (status === 'IN_PROGRESS') {
      return {
        badge: styles.inProgressBadge,
        text: styles.inProgressText,
        icon: styles.inProgressIcon,
      };
    }

    return {
      badge: styles.pendingBadge,
      text: styles.pendingText,
      icon: styles.pendingIcon,
    };
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

  function formatMaterial(materialType) {
    return MATERIAL_LABELS[materialType] || materialType || '';
  }

  function formatWeight(weight) {
    if (weight === null || weight === undefined) {
      return '';
    }

    return `${weight} ton`;
  }

  function renderTrip({ item }) {
    const statusStyle = getStatusStyle(item.status);
    const dateSource = item.status === 'COMPLETED' ? item.completedAt : item.startedAt;
    const tripDate = formatDateTime(dateSource);
    const material = formatMaterial(item.materialType);
    const weight = formatWeight(item.estimatedWeight);

    return (
      <View style={styles.tripCard}>
        <View style={styles.tripHeader}>
          <View style={[styles.tripIcon, statusStyle.icon]}>
            <Text style={[styles.tripIconText, statusStyle.text]}>V</Text>
          </View>

          <View style={styles.tripTitleArea}>
            <Text style={styles.tripTitle}>Viagem #{item.id}</Text>
            {tripDate ? <Text style={styles.tripDate}>{tripDate}</Text> : null}
          </View>

          <View style={styles.tripHeaderRight}>
            {weight ? <Text style={styles.tripWeight}>{weight}</Text> : null}
            <View style={[styles.statusBadge, statusStyle.badge]}>
              <Text style={[styles.statusText, statusStyle.text]}>{formatStatus(item.status)}</Text>
            </View>
          </View>
        </View>

        {item.driverName ? (
          <View style={styles.driverRow}>
            <Text style={styles.driverIcon}>M</Text>
            <Text style={styles.driverName}>{item.driverName}</Text>
          </View>
        ) : null}

        <View style={styles.routeArea}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.originDot]} />
            <Text style={styles.routeText}>{item.origin}</Text>
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.destinationDot]} />
            <Text style={styles.routeText}>{item.destination}</Text>
          </View>
        </View>

        {material ? (
          <View style={styles.materialArea}>
            <Text style={styles.materialText}>{material}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  const totalTrips = trips.length;
  const inProgressTrips = trips.filter((trip) => trip.status === 'IN_PROGRESS').length;
  const completedTrips = trips.filter((trip) => trip.status === 'COMPLETED').length;
  const pendingTrips = trips.filter((trip) => trip.status === 'PENDING').length;
  const recentTrips = trips.slice(0, 5);

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
              <LogOut size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

        

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.blueIcon]}>
                <Truck size={24} color="#ffffff" />
              </View>
              <Text style={styles.metricValue}>{totalTrips}</Text>
              <Text style={styles.metricLabel}>Total de viagens</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.yellowIcon]}>
                <Clock size={24} color="#ffffff" />
              </View>
              <Text style={styles.metricValue}>{inProgressTrips}</Text>
              <Text style={styles.metricLabel}>Em andamento</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.greenIcon]}>
                <CircleCheck size={24} color="#ffffff" />
              </View>
              <Text style={styles.metricValue}>{completedTrips}</Text>
              <Text style={styles.metricLabel}>Concluídas</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.grayIcon]}>
                <Clock size={24} color="#ffffff" />
              </View>
              <Text style={styles.metricValue}>{pendingTrips}</Text>
              <Text style={styles.metricLabel}>Pendentes</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Acesso Rápido</Text>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AdminTrips')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, styles.quickActionBlueIcon]}>
                <Route size={24} color="#4543b6" />
              </View>
              <Text style={styles.quickActionText}>Viagens</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('UserManagement')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, styles.quickActionGreenIcon]}>
                <Users size={24} color="#1cb123" />
              </View>
              <Text style={styles.quickActionText}>Usuários</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTextArea}>
              <Text style={styles.sectionTitle}>Viagens</Text>
              <Text style={styles.sectionSubtitle}>Monitoramento geral</Text>
            </View>

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AdminTrips')}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
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
        data={recentTrips}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTrip}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhuma viagem encontrada</Text>
            <Text style={styles.emptyText}>As viagens da empresa aparecerão aqui.</Text>
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
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
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
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sectionTextArea: {
    flex: 1,
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
  viewAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  viewAllText: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '700',
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
    padding: 18,
  },
  tripHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 18,
  },
  tripIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  tripIconText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tripTitleArea: {
    flex: 1,
    paddingRight: 8,
  },
  tripTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  tripDate: {
    color: '#64748b',
    fontSize: 12,
  },
  tripHeaderRight: {
    alignItems: 'flex-end',
  },
  tripWeight: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
  },
  completedText: {
    color: '#16a34a',
  },
  completedIcon: {
    backgroundColor: '#dcfce7',
  },
  inProgressBadge: {
    backgroundColor: '#dbeafe',
  },
  inProgressText: {
    color: '#2563eb',
  },
  inProgressIcon: {
    backgroundColor: '#dbeafe',
  },
  pendingBadge: {
    backgroundColor: '#ffedd5',
  },
  pendingText: {
    color: '#f97316',
  },
  pendingIcon: {
    backgroundColor: '#ffedd5',
  },
  driverRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 18,
  },
  driverIcon: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  driverName: {
    color: '#334155',
    flex: 1,
    fontSize: 14,
  },
  routeArea: {
    gap: 12,
    marginBottom: 18,
  },
  routeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  routeDot: {
    borderRadius: 6,
    height: 12,
    marginRight: 10,
    marginTop: 3,
    width: 12,
  },
  originDot: {
    backgroundColor: '#22c55e',
  },
  destinationDot: {
    backgroundColor: '#ef4444',
  },
  routeText: {
    color: '#0f172a',
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
  },
  materialArea: {
    borderTopColor: '#f1f5f9',
    borderTopWidth: 1,
    paddingTop: 14,
  },
  materialText: {
    color: '#334155',
    fontSize: 14,
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
