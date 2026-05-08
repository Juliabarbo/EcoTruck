import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

const FILTER_OPTIONS = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Em andamento', value: 'IN_PROGRESS' },
  { label: 'Concluidas', value: 'COMPLETED' },
  { label: 'Pendentes', value: 'PENDING' },
];

export default function TripHistoryScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filteredTrips = selectedFilter === 'ALL'
    ? trips
    : trips.filter((trip) => trip.status === selectedFilter);

  useEffect(() => {
    async function loadTrips() {
      try {
        const response = await api.get('/trips');
        setTrips(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setErrorMessage('Nao foi possivel carregar as viagens.');
      } finally {
        setIsLoading(false);
      }
    }

    loadTrips();
  }, []);

  function formatStatus(status) {
    if (status === 'COMPLETED') {
      return 'Concluida';
    }

    if (status === 'IN_PROGRESS') {
      return 'Em andamento';
    }

    if (status === 'CANCELLED') {
      return 'Cancelada';
    }

    if (status === 'PENDING') {
      return 'Pendente';
    }

    return status || 'Sem status';
  }

  function getStatusIcon(status) {
    if (status === 'COMPLETED') {
      return 'OK';
    }

    if (status === 'IN_PROGRESS') {
      return '...';
    }

    if (status === 'CANCELLED') {
      return 'X';
    }

    return '-';
  }

  function getStatusStyle(status) {
    if (status === 'COMPLETED') {
      return {
        badge: styles.completedBadge,
        text: styles.completedText,
      };
    }

    if (status === 'IN_PROGRESS') {
      return {
        badge: styles.inProgressBadge,
        text: styles.inProgressText,
      };
    }

    if (status === 'CANCELLED') {
      return {
        badge: styles.cancelledBadge,
        text: styles.cancelledText,
      };
    }

    return {
      badge: styles.pendingBadge,
      text: styles.pendingText,
    };
  }

  function renderTrip({ item }) {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.tripCard}>
        <View style={styles.cardHeader}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>{getStatusIcon(item.status)}</Text>
          </View>

          <View style={styles.cardTitleArea}>
            <Text style={styles.cardTitle}>Viagem</Text>
            <Text style={styles.cardSubtitle}>Historico de coleta</Text>
          </View>

          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>{formatStatus(item.status)}</Text>
          </View>
        </View>

        <View style={styles.routeArea}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.originDot]} />
            <View style={styles.routeTextArea}>
              <Text style={styles.label}>Origem</Text>
              <Text style={styles.value}>{item.origin}</Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.destinationDot]} />
            <View style={styles.routeTextArea}>
              <Text style={styles.label}>Destino</Text>
              <Text style={styles.value}>{item.destination}</Text>
            </View>
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
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerTextArea}>
            <Text style={styles.title}>Historico de Viagens</Text>
            <Text style={styles.subtitle}>Suas viagens realizadas</Text>
          </View>
        </View>
      </View>
    );
  }

  function renderFilters() {
    return (
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map((option) => {
          const isSelected = selectedFilter === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
              onPress={() => setSelectedFilter(option.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
        data={filteredTrips}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTrip}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderFilters}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>?</Text>
            </View>
            <Text style={styles.emptyTitle}>Nenhuma viagem encontrada</Text>
            <Text style={styles.emptyText}>As viagens criadas aparecerao aqui.</Text>
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
    backgroundColor: '#16a34a',
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
    borderColor: '#bbf7d0',
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
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#f0fdf4',
    fontSize: 14,
  },
  center: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  list: {
    padding: 24,
    paddingBottom: 32,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  filterButtonSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  filterText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#ffffff',
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  statusIconText: {
    color: '#16a34a',
    fontSize: 15,
    fontWeight: '700',
  },
  cardTitleArea: {
    flex: 1,
  },
  cardTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    color: '#6b7280',
    fontSize: 12,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  inProgressBadge: {
    backgroundColor: '#dbeafe',
  },
  inProgressText: {
    color: '#2563eb',
  },
  cancelledBadge: {
    backgroundColor: '#fee2e2',
  },
  cancelledText: {
    color: '#dc2626',
  },
  pendingBadge: {
    backgroundColor: '#f3f4f6',
  },
  pendingText: {
    color: '#4b5563',
  },
  routeArea: {
    borderTopColor: '#f3f4f6',
    borderTopWidth: 1,
    paddingTop: 14,
  },
  routeRow: {
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
  routeLine: {
    backgroundColor: '#e5e7eb',
    height: 18,
    marginLeft: 5,
    marginVertical: 3,
    width: 2,
  },
  routeTextArea: {
    flex: 1,
  },
  label: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 20,
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 14,
    width: 64,
  },
  emptyIconText: {
    color: '#9ca3af',
    fontSize: 28,
    fontWeight: '700',
  },
  emptyTitle: {
    color: '#374151',
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
