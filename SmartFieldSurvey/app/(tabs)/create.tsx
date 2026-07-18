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
const STEPS = ['Site Info', 'Details', 'Review'];

export default function CreateSurveyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentSurvey, setCurrentSurvey, addSurvey, resetCurrentSurvey } = useSurvey();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: string, value: string) => {
    setCurrentSurvey({ ...currentSurvey, [field]: value });
    if (submitted) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!currentSurvey.siteName?.trim()) newErrors.siteName = 'Site Name is required';
      if (!currentSurvey.clientName?.trim()) newErrors.clientName = 'Client Name is required';
    } else if (step === 1) {
      if (!currentSurvey.description?.trim()) newErrors.description = 'Description is required';
      if (!currentSurvey.date?.trim()) newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!validateStep()) {
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
      { text: 'OK', onPress: () => { resetCurrentSurvey(); setSubmitted(false); setErrors({}); setStep(0); } },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset Form', 'Are you sure you want to clear all fields?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => { resetCurrentSurvey(); setSubmitted(false); setErrors({}); setStep(0); } },
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((label, i) => {
        const isActive = i === step;
        const isDone = i < step;
        return (
          <React.Fragment key={label}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isDone ? colors.primary : isActive ? colors.primary : colors.surface,
                    borderColor: isDone || isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.stepNumber, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  { color: isActive || isDone ? colors.primary : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, { backgroundColor: isDone ? colors.primary : colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  const renderStep0 = () => (
    <>
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
    </>
  );

  const renderStep1 = () => (
    <>
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
    </>
  );

  const renderStep2 = () => (
    <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.reviewTitle, { color: colors.text }]}>Survey Summary</Text>
      {[
        { icon: 'location', label: 'Site Name', value: currentSurvey.siteName },
        { icon: 'person', label: 'Client', value: currentSurvey.clientName },
        { icon: 'document-text', label: 'Description', value: currentSurvey.description },
        { icon: 'flag', label: 'Priority', value: currentSurvey.priority || 'Medium' },
        { icon: 'calendar', label: 'Date', value: currentSurvey.date },
      ].map((item) => (
        <View key={item.label} style={styles.reviewRow}>
          <View style={[styles.reviewIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name={item.icon as any} size={16} color={colors.primary} />
          </View>
          <View style={styles.reviewContent}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{item.value || 'Not provided'}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      default: return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="New Survey" subtitle="Create a new field survey" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStepIndicator()}
        {renderCurrentStep()}

        <View style={styles.buttonGroup}>
          {step > 0 && (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Back</Text>
            </Pressable>
          )}

          {step < STEPS.length - 1 ? (
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
                step === 0 && styles.fullWidth,
              ]}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          ) : (
            <View style={styles.submitRow}>
              <Pressable
                onPress={handleReset}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="refresh" size={18} color={colors.textSecondary} />
                <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Reset</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Create Survey</Text>
              </Pressable>
            </View>
          )}
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginBottom: 18,
    marginHorizontal: 6,
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
  reviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F020',
  },
  reviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reviewContent: {
    flex: 1,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 1,
  },
  buttonGroup: {
    marginTop: 10,
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    flex: 1,
  },
  fullWidth: {
    flex: 1,
  },
  submitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
