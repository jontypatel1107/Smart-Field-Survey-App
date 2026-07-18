import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSurvey } from '@/context/SurveyContext';
import AppHeader from '@/components/AppHeader';

const PRIORITIES = ['Low', 'Medium', 'High'] as const;

export default function CreateSurveyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentSurvey, setCurrentSurvey, addSurvey, resetCurrentSurvey } = useSurvey();
  const router = useRouter();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: string, value: string) => {
    setCurrentSurvey({ ...currentSurvey, [field]: value });
    if (submitted) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentSurvey.siteName?.trim()) {
      newErrors.siteName = 'Site Name is required';
    }
    if (!currentSurvey.clientName?.trim()) {
      newErrors.clientName = 'Client Name is required';
    }
    if (!currentSurvey.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!currentSurvey.date?.trim()) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const newSurvey = {
      id: `SRV-${String(Date.now()).slice(-6)}`,
      siteName: currentSurvey.siteName!,
      clientName: currentSurvey.clientName!,
      description: currentSurvey.description!,
      priority: currentSurvey.priority || 'Medium',
      date: currentSurvey.date!,
      status: 'Pending' as const,
    };

    addSurvey(newSurvey);
    Alert.alert('Success', 'Survey created successfully!', [
      { text: 'OK', onPress: () => { resetCurrentSurvey(); setSubmitted(false); setErrors({}); } },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset Form', 'Are you sure you want to clear all fields?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => { resetCurrentSurvey(); setSubmitted(false); setErrors({}); } },
    ]);
  };

  const getFieldStyle = (field: string) => [
    styles.input,
    {
      backgroundColor: colors.surface,
      borderColor: errors[field] ? colors.danger : colors.border,
      color: colors.text,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="New Survey" subtitle="Create a new field survey" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Site Name */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={[styles.label, { color: colors.text }]}>Site Name *</Text>
          </View>
          <TextInput
            style={getFieldStyle('siteName')}
            placeholder="Enter site name"
            placeholderTextColor={colors.textSecondary}
            value={currentSurvey.siteName}
            onChangeText={(value) => updateField('siteName', value)}
          />
          {errors.siteName && (
            <Text style={[styles.error, { color: colors.danger }]}>{errors.siteName}</Text>
          )}
        </View>

        {/* Client Name */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="person" size={16} color={colors.primary} />
            <Text style={[styles.label, { color: colors.text }]}>Client Name *</Text>
          </View>
          <TextInput
            style={getFieldStyle('clientName')}
            placeholder="Enter client name"
            placeholderTextColor={colors.textSecondary}
            value={currentSurvey.clientName}
            onChangeText={(value) => updateField('clientName', value)}
          />
          {errors.clientName && (
            <Text style={[styles.error, { color: colors.danger }]}>{errors.clientName}</Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="document-text" size={16} color={colors.primary} />
            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
          </View>
          <TextInput
            style={[getFieldStyle('description'), styles.textArea]}
            placeholder="Describe the survey task..."
            placeholderTextColor={colors.textSecondary}
            value={currentSurvey.description}
            onChangeText={(value) => updateField('description', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text style={[styles.error, { color: colors.danger }]}>{errors.description}</Text>
          )}
        </View>

        {/* Priority */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="flag" size={16} color={colors.primary} />
            <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
          </View>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((priority) => {
              const isSelected = currentSurvey.priority === priority;
              const priorityColor =
                priority === 'High' ? colors.danger : priority === 'Medium' ? colors.warning : colors.secondary;
              return (
                <Pressable
                  key={priority}
                  onPress={() => updateField('priority', priority)}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: isSelected ? priorityColor + '20' : colors.surface,
                      borderColor: isSelected ? priorityColor : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSelected ? priorityColor : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.priorityText,
                      { color: isSelected ? priorityColor : colors.textSecondary },
                    ]}
                  >
                    {priority}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Date */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={[styles.label, { color: colors.text }]}>Date *</Text>
          </View>
          <TextInput
            style={getFieldStyle('date')}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={currentSurvey.date}
            onChangeText={(value) => updateField('date', value)}
          />
          {errors.date && (
            <Text style={[styles.error, { color: colors.danger }]}>{errors.date}</Text>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [
                styles.button,
                styles.resetButton,
                { borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="refresh" size={18} color={colors.textSecondary} />
              <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>Reset</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/survey-preview')}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.accentLight, borderWidth: 1, borderColor: colors.accent },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="eye" size={18} color={colors.accent} />
              <Text style={[styles.resetButtonText, { color: colors.accent }]}>Preview</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.fullButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Create Survey</Text>
          </Pressable>
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
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonGroup: {
    marginTop: 10,
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  fullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  resetButton: {
    borderWidth: 1,
  },
  submitButton: {
    borderWidth: 0,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
