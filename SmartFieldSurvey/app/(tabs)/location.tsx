import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSurvey } from '@/context/SurveyContext';
import AppHeader from '@/components/AppHeader';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  timestamp: number;
}

export default function LocationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setCurrentSurvey, currentSurvey } = useSurvey();

  const [permission, setPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermission(false);
          setLoading(false);
          return;
        }
        setPermission(true);
        const result = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          accuracy: result.coords.accuracy,
          altitude: result.coords.altitude,
          timestamp: result.timestamp,
        });
      } catch {
        Alert.alert('Error', 'Failed to get current location.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const requestPermissionAndGetLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermission(false);
        setLoading(false);
        return;
      }
      setPermission(true);
      await getCurrentLocation();
    } catch {
      Alert.alert('Error', 'Failed to request location permission.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        accuracy: result.coords.accuracy,
        altitude: result.coords.altitude,
        timestamp: result.timestamp,
      });
    } catch {
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    setRefreshing(false);
  };

  const handleCopyLocation = async () => {
    if (!location) return;

    const locationText = `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`;
    await Clipboard.setStringAsync(locationText);
    Alert.alert('Copied', 'Location copied to clipboard successfully!');
  };

  const handleAttachToSurvey = () => {
    if (!location) return;

    setCurrentSurvey({
      ...currentSurvey,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
    Alert.alert('Attached', 'Location has been attached to the current survey.');
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (permission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Location" />
        <View style={styles.centerContent}>
          <Ionicons name="location-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Location Access Required</Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            We need your permission to access your location for field surveys.
          </Text>
          <Pressable
            onPress={requestPermissionAndGetLocation}
            style={({ pressed }) => [
              styles.permissionButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="location" size={20} color="#FFFFFF" />
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Location" subtitle="Current GPS coordinates" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading State */}
        {loading && !location && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Getting your location...
            </Text>
          </View>
        )}

        {/* Location Display */}
        {location && (
          <>
            {/* Coordinates Card */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="navigate" size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Coordinates</Text>
              </View>

              <View style={[styles.coordBox, { backgroundColor: colors.primaryLight }]}>
                <View style={styles.coordRow}>
                  <Text style={[styles.coordLabel, { color: colors.primary }]}>Latitude</Text>
                  <Text style={[styles.coordValue, { color: colors.primary }]}>
                    {location.latitude.toFixed(6)}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.coordRow}>
                  <Text style={[styles.coordLabel, { color: colors.primary }]}>Longitude</Text>
                  <Text style={[styles.coordValue, { color: colors.primary }]}>
                    {location.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Accuracy Card */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="radio" size={20} color={colors.secondary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Accuracy</Text>
              </View>

              <View style={styles.accuracyContainer}>
                <View style={[styles.accuracyCircle, { backgroundColor: colors.secondaryLight }]}>
                  <Text style={[styles.accuracyValue, { color: colors.secondary }]}>
                    {location.accuracy ? `${location.accuracy.toFixed(1)}` : 'N/A'}
                  </Text>
                  <Text style={[styles.accuracyUnit, { color: colors.secondary }]}>meters</Text>
                </View>
                <View style={styles.accuracyDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Altitude</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {location.altitude ? `${location.altitude.toFixed(1)}m` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Timestamp</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatTimestamp(location.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Pressable
                onPress={handleRefresh}
                disabled={refreshing}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  (refreshing || loading) && { opacity: 0.5 },
                  pressed && { opacity: 0.7 },
                ]}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="refresh" size={20} color={colors.primary} />
                )}
                <Text style={[styles.actionText, { color: colors.primary }]}>
                  {refreshing ? 'Refreshing...' : 'Refresh Location'}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCopyLocation}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.accentLight, borderColor: colors.accent },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="copy" size={20} color={colors.accent} />
                <Text style={[styles.actionText, { color: colors.accent }]}>Copy Location</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleAttachToSurvey}
              style={({ pressed }) => [
                styles.attachButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name="attach" size={20} color="#FFFFFF" />
              <Text style={styles.attachButtonText}>Attach to Survey</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  coordBox: {
    borderRadius: 10,
    padding: 16,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  coordLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  coordValue: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accuracyValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  accuracyUnit: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  accuracyDetails: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  attachButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
