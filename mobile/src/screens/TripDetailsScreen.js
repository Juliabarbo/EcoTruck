import { useEffect, useMemo } from 'react';
import { ArrowLeft, CircleCheck, Package, QrCode } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MATERIAL_LABELS = {
  ENTULHO: 'Entulho',
  CONCRETO: 'Concreto',
  MADEIRA: 'Madeira',
  METAL: 'Metal',
  PLASTICO: 'Plástico',
  MISTO: 'Misto',
};

export default function TripDetailsScreen({ navigation, route }) {
  const trip = route.params?.trip;

  useEffect(() => {
    if (!trip) {
      console.log('Viagem não recebida nos parâmetros de navegação.');
    }
  }, [trip]);

  const statusStyle = useMemo(() => getStatusStyle(trip?.status), [trip?.status]);

  function formatStatus(status) {
    if (status === 'COMPLETED') {
      return 'Viagem Concluída';
    }

    if (status === 'IN_PROGRESS') {
      return 'Viagem em andamento';
    }

    if (status === 'PENDING') {
      return 'Viagem pendente';
    }

    return status || 'Sem status';
  }

  function getStatusStyle(status) {
    if (status === 'COMPLETED') {
      return {
        card: styles.completedStatusCard,
        icon: styles.completedStatusIcon,
        text: styles.completedStatusText,
        help: styles.completedStatusHelp,
      };
    }

    if (status === 'IN_PROGRESS') {
      return {
        card: styles.inProgressStatusCard,
        icon: styles.inProgressStatusIcon,
        text: styles.inProgressStatusText,
        help: styles.inProgressStatusHelp,
      };
    }

    return {
      card: styles.pendingStatusCard,
      icon: styles.pendingStatusIcon,
      text: styles.pendingStatusText,
      help: styles.pendingStatusHelp,
    };
  }

  function getStatusHelp(status) {
    if (status === 'COMPLETED') {
      return 'Descarte finalizado no sistema';
    }

    if (status === 'IN_PROGRESS') {
      return 'Viagem iniciada e ainda não concluída';
    }

    if (status === 'PENDING') {
      return 'Aguardando inicio da viagem';
    }

    return 'Status informado pelo backend';
  }

  function formatDate(value) {
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

    return `${day}/${month}/${year}`;
  }

  function formatTime(value) {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  function formatDateTime(value) {
    const date = formatDate(value);
    const time = formatTime(value);

    if (!date || !time) {
      return '';
    }

    return `${date} às ${time}`;
  }

  function formatDuration(startedAt, completedAt) {
    if (!startedAt || !completedAt) {
      return '';
    }

    const start = new Date(startedAt);
    const end = new Date(completedAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return '';
    }

    const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
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

  function formatCoordinates(latitude, longitude) {
    if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
      return '';
    }

    return `${latitude}, ${longitude}`;
  }

  function renderInfoRow(label, value, strong) {
    if (!value) {
      return null;
    }

    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, strong && styles.infoValueStrong]}>{value}</Text>
      </View>
    );
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('AdminTrips')}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTextArea}>
            <Text style={styles.title}>Viagem #{trip?.id || '-'}</Text>
            <Text style={styles.subtitle}>Detalhes completos</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.center}>
          <Text style={styles.error}>Não foi possível carregar os detalhes da viagem.</Text>
        </View>
      </View>
    );
  }

  const startedAt = formatDateTime(trip.startedAt);
  const completedAt = formatDateTime(trip.completedAt);
  const tripDate = formatDate(trip.completedAt || trip.startedAt);
  const startTime = formatTime(trip.startedAt);
  const endTime = formatTime(trip.completedAt);
  const duration = formatDuration(trip.startedAt, trip.completedAt);
  const startCoordinates = formatCoordinates(trip.latitudeInicio, trip.longitudeInicio);
  const confirmationCoordinates = formatCoordinates(trip.latitudeConfirmacao, trip.longitudeConfirmacao);

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusCard, statusStyle.card]}>
          <View style={[styles.statusIcon, statusStyle.icon]}>
            <CircleCheck size={22} color="#2E7D32" />
          </View>

          <View style={styles.statusTextArea}>
            <Text style={[styles.statusTitle, statusStyle.text]}>{formatStatus(trip.status)}</Text>
            <Text style={[styles.statusHelp, statusStyle.help]}>{getStatusHelp(trip.status)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Motorista</Text>
          {renderInfoRow('Nome', trip.driverName, true)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horários</Text>
          {renderInfoRow('Data', tripDate)}
          {renderInfoRow('Início', startTime)}
          {renderInfoRow('Término', endTime)}
          {renderInfoRow('Início completo', startedAt)}
          {renderInfoRow('Conclusão completa', completedAt)}
          {renderInfoRow('Duração total', duration, true)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Localização</Text>

          <View style={styles.locationBlock}>
            <View style={styles.locationHeader}>
              <View style={[styles.locationDot, styles.originDot]} />
              <Text style={styles.locationLabel}>ORIGEM</Text>
            </View>
            <Text style={styles.locationText}>{trip.origin || 'Sem origem'}</Text>
            {startCoordinates ? <Text style={styles.coordinates}>{startCoordinates}</Text> : null}
          </View>

          <View style={[styles.locationBlock, styles.locationBlockSeparated]}>
            <View style={styles.locationHeader}>
              <View style={[styles.locationDot, styles.destinationDot]} />
              <Text style={styles.locationLabel}>DESTINO</Text>
            </View>
            <Text style={styles.locationText}>{trip.destination || 'Sem destino'}</Text>
            {confirmationCoordinates ? <Text style={styles.coordinates}>{confirmationCoordinates}</Text> : null}
            {trip.distanceFromDestination !== null && trip.distanceFromDestination !== undefined ? (
              <Text style={styles.coordinates}>Distância registrada: {trip.distanceFromDestination}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Package size={18} color="#9E9E9E" />
            <Text style={styles.cardTitle}>Material</Text>
          </View>
          {renderInfoRow('Tipo', formatMaterial(trip.materialType), true)}
          {renderInfoRow('Peso estimado', formatWeight(trip.estimatedWeight), true)}
        </View>

        {(trip.qrCodeValidation || trip.photoUrl) ? (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <CircleCheck size={18} color="#2E7D32" />
              <Text style={styles.cardTitle}>Validação</Text>
            </View>
            {trip.qrCodeValidation ? (
              <View style={styles.qrSection}>
                <View style={styles.inlineLabelRow}>
                  <QrCode size={18} color="#9E9E9E" />
                  <Text style={styles.inlineLabel}>Código QR</Text>
                </View>
                <Text style={styles.qrValue}>{trip.qrCodeValidation}</Text>
              </View>
            ) : null}
            {trip.photoUrl ? (
              <View style={styles.urlBox}>
                <Text style={styles.urlLabel}>Foto do descarte</Text>
                <Text style={styles.urlText}>{trip.photoUrl}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.navigate('AdminTrips')}
          activeOpacity={0.8}
        >
          <Text style={styles.bottomButtonText}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 24,
    paddingBottom: 32,
  },
  statusCard: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 16,
  },
  completedStatusCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  inProgressStatusCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  pendingStatusCard: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  statusIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  completedStatusIcon: {
    backgroundColor: '#16a34a',
  },
  inProgressStatusIcon: {
    backgroundColor: '#2563eb',
  },
  pendingStatusIcon: {
    backgroundColor: '#f97316',
  },
  statusTextArea: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  completedStatusText: {
    color: '#166534',
  },
  inProgressStatusText: {
    color: '#1d4ed8',
  },
  pendingStatusText: {
    color: '#c2410c',
  },
  statusHelp: {
    fontSize: 13,
  },
  completedStatusHelp: {
    color: '#15803d',
  },
  inProgressStatusHelp: {
    color: '#2563eb',
  },
  pendingStatusHelp: {
    color: '#ea580c',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 14,
    padding: 16,
  },
  cardTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
  },
  cardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 13,
    paddingRight: 12,
  },
  infoValue: {
    color: '#334155',
    flex: 1,
    fontSize: 13,
    textAlign: 'right',
  },
  infoValueStrong: {
    color: '#0f172a',
    fontWeight: '700',
  },
  locationBlock: {
    paddingVertical: 2,
  },
  locationBlockSeparated: {
    borderTopColor: '#f1f5f9',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
  },
  locationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  locationDot: {
    borderRadius: 5,
    height: 10,
    marginRight: 8,
    width: 10,
  },
  originDot: {
    backgroundColor: '#16a34a',
  },
  destinationDot: {
    backgroundColor: '#dc2626',
  },
  locationLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  locationText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  coordinates: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 6,
  },
  qrSection: {
    paddingVertical: 7,
  },
  inlineLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  inlineLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  qrValue: {
    color: '#334155',
    fontSize: 13,
    textAlign: 'right',
  },
  urlBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginTop: 10,
    padding: 12,
  },
  urlLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  urlText: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
  },
  bottomButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 2,
  },
  bottomButtonText: {
    color: '#ffffff',
    fontSize: 15,
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
    marginTop: 12,
    textAlign: 'center',
  },
});
