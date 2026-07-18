import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSurvey } from '@/context/SurveyContext';
import AppHeader from '@/components/AppHeader';

export default function ClipboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentSurvey, surveys } = useSurvey();

  const [clipboardContent, setClipboardContent] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readClipboard();
  }, []);

  const readClipboard = async () => {
    setLoading(true);
    try {
      const content = await Clipboard.getStringAsync();
      setClipboardContent(content);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleCopySurveyId = async () => {
    const surveyId = currentSurvey.id || (surveys.length > 0 ? surveys[0].id : 'SRV-000');
    await Clipboard.setStringAsync(surveyId);
    await readClipboard();
    Alert.alert('Copied', `Survey ID "${surveyId}" copied to clipboard!`);
  };

  const handleCopyContact = async () => {
    const contact = currentSurvey.contact || 'No contact available';
    await Clipboard.setStringAsync(contact);
    await readClipboard();
    Alert.alert('Copied', 'Contact number copied to clipboard!');
  };

  const handleCopyLocation = async () => {
    const location = currentSurvey.location
      ? `Lat: ${currentSurvey.location.latitude.toFixed(6)}, Lng: ${currentSurvey.location.longitude.toFixed(6)}`
      : 'No location available';
    await Clipboard.setStringAsync(location);
    await readClipboard();
    Alert.alert('Copied', 'Location copied to clipboard!');
  };

  const handlePasteNotes = async () => {
    if (!notes.trim()) {
      Alert.alert('Empty', 'Please type some notes first.');
      return;
    }
    await Clipboard.setStringAsync(notes);
    await readClipboard();
    Alert.alert('Copied', 'Notes copied to clipboard!');
  };

  const handleClearClipboard = async () => {
    Alert.alert('Clear Clipboard', 'Are you sure you want to clear clipboard data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await Clipboard.setStringAsync('');
          setClipboardContent('');
          Alert.alert('Cleared', 'Clipboard has been cleared.');
        },
      },
    ]);
  };

  const quickCopyActions = [
    {
      title: 'Copy Survey ID',
      subtitle: currentSurvey.id || surveys[0]?.id || 'SRV-000',
      icon: 'finger-print',
      color: colors.primary,
      onPress: handleCopySurveyId,
    },
    {
      title: 'Copy Contact',
      subtitle: currentSurvey.contact || 'No contact available',
      icon: 'call',
      color: colors.secondary,
      onPress: handleCopyContact,
    },
    {
      title: 'Copy Location',
      subtitle: currentSurvey.location
        ? `${currentSurvey.location.latitude.toFixed(4)}, ${currentSurvey.location.longitude.toFixed(4)}`
        : 'No location set',
      icon: 'location',
      color: colors.warning,
      onPress: handleCopyLocation,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Clipboard" subtitle="Copy & paste data" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Clipboard Content */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Clipboard Content</Text>
            <Pressable onPress={readClipboard} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </Pressable>
          </View>
          <View style={[styles.clipboardBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.clipboardText, { color: clipboardContent ? colors.text : colors.textSecondary }]}>
                {clipboardContent || 'Clipboard is empty'}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Copy Actions */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="copy" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Copy</Text>
          </View>
          {quickCopyActions.map((action, index) => (
            <Pressable
              key={index}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.actionItem,
                { borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.background },
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={20} color={action.color} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {action.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        {/* Paste Notes */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="pencil" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Notes</Text>
          </View>
          <TextInput
            style={[styles.notesInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Type your notes here..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Pressable
            onPress={handlePasteNotes}
            style={({ pressed }) => [
              styles.pasteButton,
              { backgroundColor: colors.accentLight },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="copy" size={18} color={colors.accent} />
            <Text style={[styles.pasteButtonText, { color: colors.accent }]}>Copy Notes</Text>
          </Pressable>
        </View>

        {/* Clear Clipboard */}
        <Pressable
          onPress={handleClearClipboard}
          style={({ pressed }) => [
            styles.clearButton,
            { backgroundColor: colors.dangerLight, borderColor: colors.danger },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="trash" size={20} color={colors.danger} />
          <Text style={[styles.clearButtonText, { color: colors.danger }]}>Clear Clipboard</Text>
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
    paddingBottom: 40,
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
  refreshBtn: {
    padding: 4,
  },
  clipboardBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  clipboardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 12,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  pasteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
