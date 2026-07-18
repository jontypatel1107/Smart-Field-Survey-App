import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSurvey } from '@/context/SurveyContext';
import AppHeader from '@/components/AppHeader';

const PRIORITIES = ['Low', 'Medium', 'High'] as const;
const STATUSES = ['Pending', 'In Progress', 'Completed'] as const;

export default function SurveyPreviewScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { currentSurvey, selectedSurvey, updateSurvey, resetCurrentSurvey, setCurrentSurvey, addSurvey } = useSurvey();

  const survey = selectedSurvey || currentSurvey;
  const isExisting = !!selectedSurvey;
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<typeof survey>>({});

  const startEdit = () => {
    setEditData({ ...survey });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditData({});
  };

  const saveEdit = () => {
    if (!editData.siteName?.trim() || !editData.clientName?.trim()) {
      Alert.alert('Validation', 'Site Name and Client Name are required.');
      return;
    }
    if (isExisting && selectedSurvey) {
      updateSurvey(selectedSurvey.id, editData);
      Alert.alert('Updated', 'Survey updated successfully!');
    } else {
      setCurrentSurvey({ ...currentSurvey, ...editData });
    }
    setEditing(false);
    setEditData({});
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Survey',
      'Are you sure you want to submit this survey?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            if (isExisting && selectedSurvey) {
              updateSurvey(selectedSurvey.id, { status: 'Completed' });
            } else {
              const newSurvey = {
                id: `SRV-${Date.now()}`,
                siteName: currentSurvey.siteName || '',
                clientName: currentSurvey.clientName || '',
                description: currentSurvey.description || '',
                priority: currentSurvey.priority || 'Medium',
                date: currentSurvey.date || new Date().toISOString().split('T')[0],
                status: 'Completed' as const,
                photo: currentSurvey.photo,
                location: currentSurvey.location,
                contact: currentSurvey.contact,
                notes: currentSurvey.notes,
              };
              addSurvey(newSurvey);
            }
            Alert.alert('Submitted', 'Survey has been submitted successfully!', [
              { text: 'OK', onPress: () => { resetCurrentSurvey(); router.back(); } },
            ]);
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return colors.danger;
      case 'Medium': return colors.warning;
      default: return colors.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return colors.secondary;
      case 'In Progress': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const handleExportPDF = async () => {
    const priorityColor = survey.priority === 'High' ? '#EF4444' : survey.priority === 'Medium' ? '#F59E0B' : '#10B981';
    const statusColor = survey.status === 'Completed' ? '#10B981' : survey.status === 'In Progress' ? '#F59E0B' : '#64748B';

    const html = `
      <html>
        <head><meta charset="utf-8"><style>
          body { font-family: -apple-system, sans-serif; padding: 32px; color: #1E293B; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          .subtitle { color: #64748B; font-size: 14px; margin-bottom: 24px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-right: 8px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; }
          .field { margin-bottom: 10px; }
          .field-label { font-size: 12px; color: #64748B; font-weight: 600; }
          .field-value { font-size: 15px; margin-top: 2px; }
          .footer { margin-top: 32px; font-size: 11px; color: #94A3B8; text-align: center; }
        </style></head>
        <body>
          <h1>${survey.siteName || 'Untitled Survey'}</h1>
          <div class="subtitle">${survey.id || 'New Survey'} &bull; ${survey.date || 'No date'}</div>
          <span class="badge" style="background:${priorityColor}20;color:${priorityColor}">${survey.priority || 'Medium'} Priority</span>
          <span class="badge" style="background:${statusColor}20;color:${statusColor}">${survey.status || 'Pending'}</span>
          <div class="section" style="margin-top:24px">
            <div class="section-title">Site Details</div>
            <div class="field"><div class="field-label">Client Name</div><div class="field-value">${survey.clientName || 'Not provided'}</div></div>
            <div class="field"><div class="field-label">Description</div><div class="field-value">${survey.description || 'Not provided'}</div></div>
          </div>
          ${survey.contact ? `<div class="section"><div class="section-title">Contact</div><div class="field"><div class="field-label">Phone</div><div class="field-value">${survey.contact}</div></div></div>` : ''}
          ${survey.location ? `<div class="section"><div class="section-title">Location</div><div class="field"><div class="field-label">Latitude</div><div class="field-value">${survey.location.latitude?.toFixed(6)}</div></div><div class="field"><div class="field-label">Longitude</div><div class="field-value">${survey.location.longitude?.toFixed(6)}</div></div></div>` : ''}
          ${survey.notes ? `<div class="section"><div class="section-title">Notes</div><div class="field"><div class="field-value">${survey.notes}</div></div></div>` : ''}
          <div class="footer">Generated by Smart Field Survey App</div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch {
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };

  const renderField = (label: string, value: string | undefined, icon: string) => (
    <View style={styles.fieldRow}>
      <View style={[styles.fieldIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={styles.fieldContent}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.fieldValue, { color: colors.text }]}>
          {value || 'Not provided'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Survey Preview"
        subtitle={isExisting ? selectedSurvey?.id : 'New Survey'}
        rightIcon={editing ? undefined : 'create'}
        onRightPress={editing ? undefined : startEdit}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {editing ? (
          <>
            {/* Edit Mode */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="create" size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Edit Survey</Text>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Site Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={editData.siteName}
                onChangeText={(v) => setEditData({ ...editData, siteName: v })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Client Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={editData.clientName}
                onChangeText={(v) => setEditData({ ...editData, clientName: v })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={editData.description}
                onChangeText={(v) => setEditData({ ...editData, description: v })}
                multiline
                textAlignVertical="top"
              />

              <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
              <View style={styles.optionRow}>
                {PRIORITIES.map((p) => {
                  const isSelected = editData.priority === p;
                  const pc = p === 'High' ? colors.danger : p === 'Medium' ? colors.warning : colors.secondary;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => setEditData({ ...editData, priority: p })}
                      style={[
                        styles.optionButton,
                        { backgroundColor: isSelected ? pc + '20' : colors.background, borderColor: isSelected ? pc : colors.border },
                      ]}
                    >
                      <Ionicons name={isSelected ? 'radio-button-on' : 'radio-button-off'} size={16} color={isSelected ? pc : colors.textSecondary} />
                      <Text style={{ color: isSelected ? pc : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{p}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Status</Text>
              <View style={styles.optionRow}>
                {STATUSES.map((s) => {
                  const isSelected = editData.status === s;
                  const sc = getStatusColor(s);
                  return (
                    <Pressable
                      key={s}
                      onPress={() => setEditData({ ...editData, status: s })}
                      style={[
                        styles.optionButton,
                        { backgroundColor: isSelected ? sc + '20' : colors.background, borderColor: isSelected ? sc : colors.border },
                      ]}
                    >
                      <Ionicons name={isSelected ? 'radio-button-on' : 'radio-button-off'} size={16} color={isSelected ? sc : colors.textSecondary} />
                      <Text style={{ color: isSelected ? sc : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{s}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Contact</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={editData.contact}
                onChangeText={(v) => setEditData({ ...editData, contact: v })}
                placeholder="Phone number"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={editData.notes}
                onChangeText={(v) => setEditData({ ...editData, notes: v })}
                multiline
                textAlignVertical="top"
                placeholder="Additional notes..."
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.editActions}>
                <Pressable
                  onPress={cancelEdit}
                  style={({ pressed }) => [styles.editButton, { borderColor: colors.border }, pressed && { opacity: 0.7 }]}
                >
                  <Text style={[styles.editButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={saveEdit}
                  style={({ pressed }) => [styles.editButton, { backgroundColor: colors.primary }, pressed && { opacity: 0.8 }]}
                >
                  <Text style={[styles.editButtonText, { color: '#FFFFFF' }]}>Save Changes</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* View Mode */}
            {/* Photo */}
            {survey.photo ? (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="camera" size={20} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Site Photo</Text>
                </View>
                <Image source={{ uri: survey.photo }} style={styles.photo} resizeMode="cover" />
              </View>
            ) : null}

            {/* Site Details */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Site Details</Text>
              </View>
              {renderField('Site Name', survey.siteName, 'business')}
              {renderField('Client Name', survey.clientName, 'person')}
              {renderField('Description', survey.description, 'document-text')}
              {renderField('Date', survey.date, 'calendar')}

              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: getPriorityColor(survey.priority || 'Medium') + '20' }]}>
                  <Ionicons name="flag" size={14} color={getPriorityColor(survey.priority || 'Medium')} />
                  <Text style={[styles.badgeText, { color: getPriorityColor(survey.priority || 'Medium') }]}>
                    {survey.priority || 'Medium'} Priority
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusColor(survey.status || 'Pending') + '20' }]}>
                  <Ionicons name="checkmark-circle" size={14} color={getStatusColor(survey.status || 'Pending')} />
                  <Text style={[styles.badgeText, { color: getStatusColor(survey.status || 'Pending') }]}>
                    {survey.status || 'Pending'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Contact */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="call" size={20} color={colors.secondary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Contact</Text>
              </View>
              {renderField('Phone', survey.contact, 'phone-portrait')}
            </View>

            {/* Location */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="navigate" size={20} color={colors.warning} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Location</Text>
              </View>
              {survey.location ? (
                <>
                  {renderField('Latitude', survey.location.latitude?.toFixed(6), 'locate')}
                  {renderField('Longitude', survey.location.longitude?.toFixed(6), 'locate')}
                </>
              ) : (
                <Text style={[styles.noData, { color: colors.textSecondary }]}>No location data available</Text>
              )}
            </View>

            {/* Notes */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text" size={20} color={colors.accent} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Notes</Text>
              </View>
              {renderField('Notes', survey.notes, 'pencil')}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <Pressable
                onPress={startEdit}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="create" size={18} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
              </Pressable>

              <Pressable
                onPress={handleExportPDF}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.accentLight, borderColor: colors.accent },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="document-text" size={18} color={colors.accent} />
                <Text style={[styles.actionText, { color: colors.accent }]}>Export PDF</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.secondaryLight, borderColor: colors.secondary },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="checkmark-circle" size={18} color={colors.secondary} />
                <Text style={[styles.actionText, { color: colors.secondary }]}>Submit</Text>
              </Pressable>
            </View>
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
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  noData: {
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
