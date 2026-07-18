import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Survey } from '@/constants/data';
import { useSurvey } from '@/context/SurveyContext';
import AppHeader from '@/components/AppHeader';

const PRIORITY_FILTERS = ['All', 'Low', 'Medium', 'High'] as const;

type PriorityFilter = (typeof PRIORITY_FILTERS)[number];

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { surveys, deleteSurvey, setSelectedSurvey } = useSurvey();

  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredSurveys = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return surveys.filter((survey) => {
      const matchesPriority =
        priorityFilter === 'All' || survey.priority === priorityFilter;
      const matchesSearch =
        !query ||
        survey.siteName.toLowerCase().includes(query) ||
        survey.clientName.toLowerCase().includes(query) ||
        survey.id.toLowerCase().includes(query) ||
        survey.description.toLowerCase().includes(query) ||
        survey.status.toLowerCase().includes(query);

      return matchesPriority && matchesSearch;
    });
  }, [priorityFilter, searchText, surveys]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  const getPriorityColor = (priority: Survey['priority']) => {
    switch (priority) {
      case 'High':
        return colors.danger;
      case 'Medium':
        return colors.warning;
      default:
        return colors.secondary;
    }
  };

  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'Completed':
        return colors.secondary;
      case 'In Progress':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const viewSurveyDetails = (survey: Survey) => {
    setSelectedSurvey(survey);
    router.push('/survey-preview');
  };

  const confirmDelete = (survey: Survey) => {
    Alert.alert(
      'Delete Survey',
      `Are you sure you want to delete ${survey.id} for ${survey.siteName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSurvey(survey.id),
        },
      ]
    );
  };

  const clearFilters = () => {
    setSearchText('');
    setPriorityFilter('All');
  };

  const renderSurvey = ({ item }: { item: Survey }) => {
    const priorityColor = getPriorityColor(item.priority);
    const statusColor = getStatusColor(item.status);

    return (
      <Pressable
        onPress={() => viewSurveyDetails(item)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.cardTopRow}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnailFallback, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
            </View>
          )}

          <View style={styles.cardMain}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.siteName, { color: colors.text }]} numberOfLines={1}>
                {item.siteName}
              </Text>
              <Pressable
                onPress={() => confirmDelete(item)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.deleteButton,
                  { backgroundColor: colors.dangerLight },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="trash" size={16} color={colors.danger} />
              </Pressable>
            </View>

            <Text style={[styles.clientName, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.clientName}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="key" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.id}</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: priorityColor + '20' }]}>
            <Ionicons name="flag" size={13} color={priorityColor} />
            <Text style={[styles.badgeText, { color: priorityColor }]}>
              {item.priority} Priority
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name="checkmark-circle" size={13} color={statusColor} />
            <Text style={[styles.badgeText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={[styles.detailsHint, { borderTopColor: colors.border }]}>
          <Text style={[styles.detailsText, { color: colors.primary }]}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="search" size={30} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No surveys found</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Try another search term or priority filter.
      </Text>
      <View style={styles.emptyButton}>
        <Button title="Clear Filters" color={colors.primary} onPress={clearFilters} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Survey History" subtitle={`${surveys.length} saved surveys`} />

      <View style={styles.content}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by site, client, ID, status..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <Pressable onPress={() => setSearchText('')} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          {PRIORITY_FILTERS.map((priority) => {
            const isActive = priorityFilter === priority;
            const priorityColor =
              priority === 'High'
                ? colors.danger
                : priority === 'Medium'
                  ? colors.warning
                  : priority === 'Low'
                    ? colors.secondary
                    : colors.primary;

            return (
              <Pressable
                key={priority}
                onPress={() => setPriorityFilter(priority)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? priorityColor + '20' : colors.surface,
                    borderColor: isActive ? priorityColor : colors.border,
                  },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? priorityColor : colors.textSecondary },
                  ]}
                >
                  {priority}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.resultSummary}>
          <Text style={[styles.resultText, { color: colors.textSecondary }]}>
            Showing {filteredSurveys.length} of {surveys.length} surveys
          </Text>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
              Loading survey history...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSurveys}
            keyExtractor={(item) => item.id}
            renderItem={renderSurvey}
            contentContainerStyle={[
              styles.listContent,
              filteredSurveys.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBox: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    flex: 1,
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultSummary: {
    paddingVertical: 12,
  },
  resultText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    fontSize: 14,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
  },
  thumbnailFallback: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardMain: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  siteName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  detailsHint: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    gap: 3,
  },
  detailsText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 14,
  },
});
