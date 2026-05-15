import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Filter } from 'lucide-react-native';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

const STATUS_OPTIONS = [
  { label: 'Todas as viagens', value: 'ALL' },
  { label: 'Pendentes', value: 'PENDING' },
  { label: 'Em andamento', value: 'IN_PROGRESS' },
  { label: 'Concluídas', value: 'COMPLETED' },
];

const PERIOD_OPTIONS = [
  { label: 'Hoje', value: 'TODAY' },
  { label: 'Esta semana', value: 'WEEK' },
  { label: 'Este mês', value: 'MONTH' },
];

const MATERIAL_LABELS = {
  ENTULHO: 'Entulho',
  CONCRETO: 'Concreto',
  MADEIRA: 'Madeira',
  METAL: 'Metal',
  PLASTICO: 'Plástico',
  MISTO: 'Misto',
};

export default function AdminTripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('MONTH');
  const [isStatusDropdownVisible, setIsStatusDropdownVisible] = useState(false);

  useEffect(() => {
    async function loadTrips() {
      setErrorMessage('');
      setIsLoading(true);

      try {
        const response = await api.get('/trips');
        setTrips(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log(error);
        setErrorMessage('Não foi possível carregar as viagens.');
      } finally {
        setIsLoading(false);
      }
    }

    loadTrips();
  }, []);

  function getTripDateValue(trip) {
    if (trip.status === 'COMPLETED') {
      return trip.completedAt || trip.startedAt;
    }

    return trip.startedAt || trip.completedAt;
  }

  function getTripDate(trip) {
    const value = getTripDateValue(trip);

    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function isSameDay(date, reference) {
    return date.getFullYear() === reference.getFullYear()
      && date.getMonth() === reference.getMonth()
      && date.getDate() === reference.getDate();
  }

  function isThisWeek(date, reference) {
    const startOfWeek = new Date(reference);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(reference.getDate() - reference.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return date >= startOfWeek && date < endOfWeek;
  }

  function isThisMonth(date, reference) {
    return date.getFullYear() === reference.getFullYear()
      && date.getMonth() === reference.getMonth();
  }

  function matchesPeriod(trip) {
    const date = getTripDate(trip);

    if (!date) {
      return false;
    }

    const today = new Date();

    if (periodFilter === 'TODAY') {
      return isSameDay(date, today);
    }

    if (periodFilter === 'WEEK') {
      return isThisWeek(date, today);
    }

    return isThisMonth(date, today);
  }

  const filteredTrips = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesStatus = statusFilter === 'ALL' || trip.status === statusFilter;
      const matchesDate = matchesPeriod(trip);

      const searchFields = [
        String(trip.id || ''),
        trip.driverName || '',
        trip.origin || '',
        trip.destination || '',
      ].join(' ').toLowerCase();

      const matchesSearch = !normalizedSearch || searchFields.includes(normalizedSearch);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [trips, searchTerm, statusFilter, periodFilter]);

  const stats = useMemo(() => {
    const totalWeight = filteredTrips
      .filter((trip) => trip.status === 'COMPLETED')
      .reduce((total, trip) => {
        const weight = Number(trip.estimatedWeight);
        return Number.isNaN(weight) ? total : total + weight;
      }, 0);

    return {
      total: filteredTrips.length,
      completed: filteredTrips.filter((trip) => trip.status === 'COMPLETED').length,
      inProgress: filteredTrips.filter((trip) => trip.status === 'IN_PROGRESS').length,
      tons: Number(totalWeight.toFixed(2)),
    };
  }, [filteredTrips]);

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

  function getSelectedStatusLabel() {
    return STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label || 'Todas as viagens';
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

  function formatDateTime(trip) {
    const date = getTripDate(trip);

    if (!date) {
      return 'Sem data';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  }

  function formatMaterial(materialType) {
    return MATERIAL_LABELS[materialType] || materialType || 'Sem material';
  }

  function formatWeight(weight) {
    if (weight === null || weight === undefined) {
      return 'Sem peso';
    }

    return `${weight} ton`;
  }

  function renderHeader() {
    return (
      <View>
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
              <Text style={styles.title}>Gestão de Viagens</Text>
              <Text style={styles.subtitle}>Monitoramento completo</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statCaption}>Total</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statCaption}>Concluídas</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.inProgress}</Text>
              <Text style={styles.statCaption}>Andamento</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.tons}</Text>
              <Text style={styles.statCaption}>Toneladas</Text>
            </View>
          </View>
        </View>

        <View style={styles.filtersArea}>
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Buscar por ID, motorista ou local..."
            placeholderTextColor="#64748b"
          />

          <View style={styles.statusFilterRow}>
            <View style={styles.filterIcon}>
              <Filter size={20} color="#FFFFFF" />
            </View>

            <View style={styles.statusFilterArea}>
              <TouchableOpacity
                style={styles.statusSelector}
                onPress={() => setIsStatusDropdownVisible((current) => !current)}
                activeOpacity={0.8}
              >
                <Text style={styles.statusSelectorValue}>{getSelectedStatusLabel()}</Text>
                <Text style={styles.statusSelectorArrow}>v</Text>
              </TouchableOpacity>

              {isStatusDropdownVisible ? (
                <View style={styles.statusDropdown}>
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = statusFilter === option.value;

                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                        onPress={() => {
                          setStatusFilter(option.value);
                          setIsStatusDropdownVisible(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.dropdownOptionText}>{option.label}</Text>
                        {isSelected ? <Text style={styles.dropdownCheck}>✓</Text> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Período</Text>
            <View style={styles.filterOptions}>
              {PERIOD_OPTIONS.map((option) => {
                const isSelected = periodFilter === option.value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
                    onPress={() => setPeriodFilter(option.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  }

  function renderTrip({ item }) {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.tripCard}>
        <View style={styles.tripHeader}>
          <View style={[styles.statusIcon, statusStyle.icon]}>
            <Text style={[styles.statusIconText, statusStyle.text]}>V</Text>
          </View>

          <View style={styles.tripTitleArea}>
            <Text style={styles.tripId}>Viagem #{item.id}</Text>
            <Text style={styles.tripDate}>{formatDateTime(item)}</Text>
          </View>

          <View style={styles.tripMeta}>
            <Text style={styles.tripWeight}>{formatWeight(item.estimatedWeight)}</Text>
            <View style={[styles.statusBadge, statusStyle.badge]}>
              <Text style={[styles.statusText, statusStyle.text]}>{formatStatus(item.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.driverRow}>
          <Text style={styles.driverLabel}>Motorista</Text>
          <Text style={styles.driverName}>{item.driverName || 'Sem motorista'}</Text>
        </View>

        <View style={styles.routeArea}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.originDot]} />
            <Text style={styles.routeText}>{item.origin || 'Sem origem'}</Text>
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.destinationDot]} />
            <Text style={styles.routeText}>{item.destination || 'Sem destino'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.materialText}>{formatMaterial(item.materialType)}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('TripDetailsScreen', { trip: item })}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsLink}>Ver detalhes →</Text>
          </TouchableOpacity>
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
        data={filteredTrips}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTrip}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nenhuma viagem encontrada</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  header: {
    backgroundColor: '#1f2937',
    paddingBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
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
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statCaption: {
    color: '#d1d5db',
    fontSize: 11,
    textAlign: 'center',
  },
  filtersArea: {
    padding: 24,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 14,
    height: 46,
    paddingHorizontal: 14,
  },
  filterGroup: {
    marginTop: 14,
  },
  filterTitle: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusFilterRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 12,
  },
  filterIcon: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginRight: 10,
    width: 36,
  },
  statusFilterArea: {
    flex: 1,
  },
  statusSelector: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  statusSelectorValue: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  statusSelectorArrow: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  statusDropdown: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
    marginTop: 4,
    padding: 4,
  },
  dropdownOption: {
    alignItems: 'center',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  dropdownOptionSelected: {
    backgroundColor: '#e5e7eb',
  },
  dropdownOptionText: {
    color: '#0f172a',
    fontSize: 14,
  },
  dropdownCheck: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  filterButtonText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  filterButtonTextSelected: {
    color: '#ffffff',
  },
  list: {
    paddingBottom: 32,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    marginHorizontal: 24,
    marginTop: 12,
    padding: 16,
  },
  tripHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 14,
  },
  statusIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  statusIconText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tripTitleArea: {
    flex: 1,
    paddingRight: 8,
  },
  tripId: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  tripDate: {
    color: '#64748b',
    fontSize: 12,
  },
  tripMeta: {
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
    marginBottom: 14,
  },
  driverLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
  },
  driverName: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  routeArea: {
    gap: 10,
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
  cardFooter: {
    alignItems: 'center',
    borderTopColor: '#f1f5f9',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  materialText: {
    color: '#334155',
    flex: 1,
    fontSize: 14,
    paddingRight: 12,
  },
  detailsLink: {
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
  emptyBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyTitle: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
