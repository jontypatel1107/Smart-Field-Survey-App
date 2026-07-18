import React, { useMemo } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Colors } from '@/constants/theme';
import { studentInfo } from '@/constants/data';
import { useSurvey } from '@/context/SurveyContext';
import AppHeader from '@/components/AppHeader';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const PROFILE_DETAILS = [
  { label: 'Employee ID', value: studentInfo.id, icon: 'id-card' },
  { label: 'Program', value: studentInfo.course, icon: 'school' },
  { label: 'Semester', value: studentInfo.semester, icon: 'calendar' },
  { label: 'Organization', value: studentInfo.university, icon: 'business' },
] as const;

const CONTACT_DETAILS = [
  { label: 'Email', value: 'jonty.patel@fieldsurvey.app', icon: 'mail' },
  { label: 'Phone', value: '+91 98765 43210', icon: 'call' },
  { label: 'Base Station', value: 'Ahmedabad Field Office', icon: 'location' },
  { label: 'Role', value: 'Field Survey Trainee', icon: 'briefcase' },
] as const;

const PREFERENCES = [
  { label: 'Offline Sync', value: 'Enabled', icon: 'cloud-done', tone: 'secondary' },
  { label: 'Photo Capture', value: 'High Quality', icon: 'camera', tone: 'accent' },
  { label: 'Location Tracking', value: 'Ask Every Time', icon: 'navigate', tone: 'warning' },
] as const;

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { preference, setPreference } = useTheme();
  const router = useRouter();
  const { surveys, profileImage, setProfileImage } = useSurvey();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const initials = studentInfo.name
    .split(' ')
    .map((name) => name[0])
    .join('');

  const surveyStats = useMemo(() => {
    const completed = surveys.filter((survey) => survey.status === 'Completed').length;
    const active = surveys.filter((survey) => survey.status === 'In Progress').length;
    const pending = surveys.filter((survey) => survey.status === 'Pending').length;
    const highPriority = surveys.filter((survey) => survey.priority === 'High').length;
    const completionRate = surveys.length
      ? Math.round((completed / surveys.length) * 100)
      : 0;

    return { completed, active, pending, highPriority, completionRate };
  }, [surveys]);

  const handlePickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission Needed',
        'Please allow gallery access to set your profile image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const originalUri = result.assets[0].uri;
      const filename = `profile_image_${Date.now()}.jpg`;
      const destUri = `${FileSystem.documentDirectory}${filename}`;

      try {
        await FileSystem.copyAsync({ from: originalUri, to: destUri });
        setProfileImage(destUri);
      } catch {
        setProfileImage(originalUri);
      }
    }
  };

  const handleEditProfile = () => {
    const options = profileImage
      ? [
          { text: 'Choose Photo', onPress: handlePickProfileImage },
          { text: 'Remove Photo', style: 'destructive' as const, onPress: () => setProfileImage(null) },
          { text: 'Cancel', style: 'cancel' as const },
        ]
      : [
          { text: 'Choose Photo', onPress: handlePickProfileImage },
          { text: 'Cancel', style: 'cancel' as const },
        ];

    Alert.alert('Profile Photo', 'Update your profile image.', options);
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@fieldsurvey.app?subject=Smart Field Survey Support');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive' },
    ]);
  };

  const profileStats = [
    { label: 'Total', value: String(surveys.length), color: colors.primary, icon: 'documents' },
    { label: 'Completed', value: String(surveyStats.completed), color: colors.secondary, icon: 'checkmark-done' },
    { label: 'Active', value: String(surveyStats.active), color: colors.warning, icon: 'flash' },
    { label: 'Rate', value: `${surveyStats.completionRate}%`, color: colors.accent, icon: 'trending-up' },
  ] as const;

  const renderInfoRow = (
    item: { label: string; value: string; icon: IoniconName },
    index: number
  ) => (
    <View
      key={`${item.label}-${item.value}`}
      style={[
        styles.infoRow,
        index !== PROFILE_DETAILS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
      ]}
    >
      <View style={[styles.infoIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={item.icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Profile" subtitle="Surveyor workspace" rightIcon="settings-outline" onRightPress={handleEditProfile} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.profileTop}>
            <Pressable
              onPress={handlePickProfileImage}
              style={[
                styles.avatarButton,
                {
                  height: isCompact ? 62 : 72,
                  width: isCompact ? 62 : 72,
                  borderRadius: isCompact ? 31 : 36,
                  marginRight: isCompact ? 12 : 14,
                },
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
              </View>
              <View style={[styles.avatarBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="camera" size={13} color={colors.primary} />
              </View>
            </Pressable>
            <View style={styles.profileMain}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {studentInfo.name}
              </Text>
              <Text style={[styles.role, { color: colors.textSecondary }]}>Field Survey Trainee</Text>
              <View style={[styles.statusPill, { backgroundColor: colors.secondaryLight }]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
                <Text style={[styles.statusText, { color: colors.secondary }]}>Available for visits</Text>
              </View>
            </View>
            <Pressable
              onPress={handleEditProfile}
              hitSlop={8}
              style={({ pressed }) => [
                styles.editButton,
                { backgroundColor: colors.primaryLight },
                pressed && { opacity: 0.75 },
              ]}
            >
              <Ionicons name="create" size={18} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.quickMetaRow}>
            <View style={[styles.quickMeta, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={[styles.quickMetaText, { color: colors.primary }]}>North Zone</Text>
            </View>
            <View style={[styles.quickMeta, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="shield-checkmark" size={14} color={colors.accent} />
              <Text style={[styles.quickMetaText, { color: colors.accent }]}>Verified</Text>
            </View>
          </View>

          <View style={[styles.assignmentBox, { backgroundColor: colors.background }]}>
            <View style={styles.assignmentHeader}>
              <Ionicons name="map" size={18} color={colors.primary} />
              <Text style={[styles.assignmentTitle, { color: colors.text }]}>Current Assignment</Text>
            </View>
            <Text style={[styles.assignmentText, { color: colors.textSecondary }]}>
              North Zone property audits and site documentation
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            {profileStats.slice(0, 2).map((stat) => (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Ionicons name={stat.icon} size={16} color={stat.color} />
                </View>
                <View>
                  <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.statsRow}>
            {profileStats.slice(2).map((stat) => (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Ionicons name={stat.icon} size={16} color={stat.color} />
                </View>
                <View>
                  <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Workload Summary</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Completion</Text>
            <Text style={[styles.progressValue, { color: colors.text }]}>{surveyStats.completionRate}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${surveyStats.completionRate}%` },
              ]}
            />
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="time" size={14} color={colors.warning} />
              <Text style={[styles.badgeText, { color: colors.warning }]}>{surveyStats.pending} pending</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.dangerLight }]}>
              <Ionicons name="flag" size={14} color={colors.danger} />
              <Text style={[styles.badgeText, { color: colors.danger }]}>{surveyStats.highPriority} high priority</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Profile Details</Text>
          </View>
          {PROFILE_DETAILS.map(renderInfoRow)}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="call" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Contact & Field Info</Text>
          </View>
          {CONTACT_DETAILS.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.infoRow,
                index !== CONTACT_DETAILS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}
            >
              <View style={[styles.infoIcon, { backgroundColor: colors.accentLight }]}>
                <Ionicons name={item.icon} size={18} color={colors.accent} />
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="options" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Field Preferences</Text>
          </View>
          {PREFERENCES.map((item) => {
            const toneColor = colors[item.tone];
            const toneBackground = colors[`${item.tone}Light` as keyof typeof colors] as string;

            return (
              <View key={item.label} style={styles.preferenceRow}>
                <View style={[styles.infoIcon, { backgroundColor: toneBackground }]}>
                  <Ionicons name={item.icon} size={18} color={toneColor} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </View>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="color-palette" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance</Text>
          </View>
          <View style={styles.themeRow}>
            {(['light', 'dark'] as const).map((pref) => {
              const isActive = preference === pref;
              const icon = pref === 'light' ? 'sunny' : 'moon';
              return (
                <Pressable
                  key={pref}
                  onPress={() => setPreference(pref)}
                  style={({ pressed }) => [
                    styles.themeOption,
                    {
                      backgroundColor: isActive ? colors.primary + '20' : colors.background,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Ionicons name={icon as any} size={20} color={isActive ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.themeLabel, { color: isActive ? colors.primary : colors.textSecondary }]}>
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => router.push('/(tabs)/history')}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.82 },
            ]}
          >
            <Ionicons name="time" size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>View History</Text>
          </Pressable>

          <Pressable
            onPress={handleSupport}
            style={({ pressed }) => [
              styles.secondaryActionButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Ionicons name="help-circle" size={18} color={colors.primary} />
            <Text style={[styles.secondaryActionText, { color: colors.primary }]}>Support</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            { backgroundColor: colors.dangerLight },
            pressed && { opacity: 0.75 },
          ]}
        >
          <Ionicons name="log-out" size={18} color={colors.danger} />
          <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
        </Pressable>
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
    paddingBottom: 36,
  },
  heroCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 14,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  profileMain: {
    flex: 1,
  },
  name: {
    fontSize: 21,
    fontWeight: '800',
    paddingRight: 8,
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    gap: 5,
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  quickMeta: {
    minHeight: 32,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 5,
  },
  quickMetaText: {
    fontSize: 12,
    fontWeight: '800',
  },
  assignmentBox: {
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  assignmentText: {
    fontSize: 13,
    lineHeight: 19,
  },
  statsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minHeight: 78,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 12,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
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
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
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
    paddingVertical: 7,
    gap: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  secondaryActionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '800',
  },
  signOutButton: {
    minHeight: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
