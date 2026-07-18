import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { mockSurveys, studentInfo } from '@/constants/data';
import AppHeader from '@/components/AppHeader';
import QuickActionCard from '@/components/QuickActionCard';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const todayCount = mockSurveys.filter(
    (s) => s.date === '2026-07-18'
  ).length;

  const recentSurveys = mockSurveys.slice(0, 3);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return colors.danger;
      case 'Medium':
        return colors.warning;
      default:
        return colors.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return colors.secondary;
      case 'In Progress':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const quickActions = [
    { title: 'New Survey', icon: 'add-circle', color: colors.primary, route: '/(tabs)/create' },
    { title: 'Camera', icon: 'camera', color: colors.accent, route: '/(tabs)/camera' },
    { title: 'Location', icon: 'location', color: colors.secondary, route: '/(tabs)/location' },
    { title: 'Contacts', icon: 'people', color: colors.warning, route: '/(tabs)/contacts' },
    { title: 'Clipboard', icon: 'clipboard', color: colors.danger, route: '/(tabs)/clipboard' },
    { title: 'History', icon: 'time', color: colors.accent, route: '/(tabs)/history' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        subtitle={`${getGreeting()}, ${studentInfo.name.split(' ')[0]}!`}
        rightIcon="notifications-outline"
        onRightPress={() => {}}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Student Details Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Student Details</Text>
          </View>
          <View style={styles.studentInfo}>
            <View style={styles.studentAvatar}>
              <Text style={styles.avatarText}>
                {studentInfo.name.split(' ').map((n) => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.studentDetails}>
              <Text style={[styles.studentName, { color: colors.text }]}>{studentInfo.name}</Text>
              <Text style={[styles.studentMeta, { color: colors.textSecondary }]}>
                ID: {studentInfo.id}
              </Text>
              <Text style={[styles.studentMeta, { color: colors.textSecondary }]}>
                {studentInfo.course} | {studentInfo.semester}
              </Text>
              <Text style={[styles.studentMeta, { color: colors.textSecondary }]}>
                {studentInfo.university}
              </Text>
            </View>
          </View>
        </View>

        {/* Survey Count Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="bar-chart" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{"Today's Survey Count"}</Text>
          </View>
          <View style={styles.countContainer}>
            <View style={[styles.countBox, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.countNumber, { color: colors.primary }]}>{todayCount}</Text>
              <Text style={[styles.countLabel, { color: colors.primary }]}>Today</Text>
            </View>
            <View style={[styles.countBox, { backgroundColor: colors.secondaryLight }]}>
              <Text style={[styles.countNumber, { color: colors.secondary }]}>
                {mockSurveys.length}
              </Text>
              <Text style={[styles.countLabel, { color: colors.secondary }]}>Total</Text>
            </View>
            <View style={[styles.countBox, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.countNumber, { color: colors.warning }]}>
                {mockSurveys.filter((s) => s.status === 'In Progress').length}
              </Text>
              <Text style={[styles.countLabel, { color: colors.warning }]}>Active</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Actions</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                icon={action.icon}
                color={action.color}
                onPress={() => router.push(action.route as any)}
              />
            ))}
          </View>
        </View>

        {/* Recent Survey Summary */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Surveys</Text>
            <Pressable onPress={() => router.push('/(tabs)/history')}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
            </Pressable>
          </View>
          {recentSurveys.map((survey) => (
            <Pressable
              key={survey.id}
              style={({ pressed }) => [
                styles.surveyItem,
                { borderColor: colors.border },
                pressed && { backgroundColor: colors.background },
              ]}
              onPress={() => router.push(`/(tabs)/history` as any)}
            >
              <View style={styles.surveyItemLeft}>
                <Text style={[styles.surveySite, { color: colors.text }]}>{survey.siteName}</Text>
                <Text style={[styles.surveyClient, { color: colors.textSecondary }]}>
                  {survey.clientName}
                </Text>
              </View>
              <View style={styles.surveyItemRight}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(survey.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(survey.priority) }]}>
                    {survey.priority}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(survey.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(survey.status) }]}>
                    {survey.status}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
    flex: 1,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  studentMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countBox: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  countNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  countLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  surveyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  surveyItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  surveySite: {
    fontSize: 14,
    fontWeight: '600',
  },
  surveyClient: {
    fontSize: 12,
    marginTop: 2,
  },
  surveyItemRight: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
