import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import AppHeader from '@/components/AppHeader';

interface ContactItem {
  id: string;
  name: string;
  phone: string | null;
  initials: string;
}

export default function ContactsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [permission, setPermission] = useState<boolean | null>(null);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== 'granted') {
          setPermission(false);
          setLoading(false);
          return;
        }
        setPermission(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        const mapped: ContactItem[] = data
          .filter((c) => c.name)
          .map((c) => {
            const phone = c.phoneNumbers && c.phoneNumbers.length > 0
              ? c.phoneNumbers[0].number ?? null
              : null;
            const names = c.name.split(' ');
            const initials = names.length >= 2
              ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
              : c.name.substring(0, 2).toUpperCase();
            return { id: c.id, name: c.name, phone, initials };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        setContacts(mapped);
        setFilteredContacts(mapped);
      } catch {
        Alert.alert('Error', 'Failed to load contacts.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.phone && c.phone.includes(query))
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const fetchContacts = async () => {
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      const mapped: ContactItem[] = data
        .filter((c) => c.name)
        .map((c) => {
          const phone = c.phoneNumbers && c.phoneNumbers.length > 0
            ? c.phoneNumbers[0].number ?? null
            : null;
          const names = c.name.split(' ');
          const initials = names.length >= 2
            ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
            : c.name.substring(0, 2).toUpperCase();
          return { id: c.id, name: c.name, phone, initials };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      setContacts(mapped);
      setFilteredContacts(mapped);
    } catch {
      Alert.alert('Error', 'Failed to fetch contacts.');
    }
  };

  const handleRetryPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermission(false);
        setLoading(false);
        return;
      }
      setPermission(true);
      await fetchContacts();
    } catch {
      Alert.alert('Error', 'Failed to request contacts permission.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  }, []);

  const handleCopyNumber = async (phone: string) => {
    await Clipboard.setStringAsync(phone);
    Alert.alert('Copied', 'Contact number copied to clipboard!');
  };

  const getAvatarColor = (initials: string) => {
    const colors = [
      '#2563EB', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (permission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Contacts" />
        <View style={styles.centerContent}>
          <Ionicons name="people-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Contacts Access Required</Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            We need your permission to access contacts for field surveys.
          </Text>
          <Pressable
            onPress={handleRetryPermission}
            style={({ pressed }) => [
              styles.permissionButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="people" size={20} color="#FFFFFF" />
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const renderContact = ({ item }: { item: ContactItem }) => (
    <View style={[styles.contactItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.initials) }]}>
        <Text style={styles.avatarText}>{item.initials}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.phone ? (
          <Text style={[styles.contactPhone, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.phone}
          </Text>
        ) : (
          <Text style={[styles.noNumber, { color: colors.danger }]}>No Number</Text>
        )}
      </View>
      {item.phone && (
        <Pressable
          onPress={() => handleCopyNumber(item.phone!)}
          style={({ pressed }) => [styles.copyButton, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="copy" size={20} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={60} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Contacts Found</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {searchQuery ? 'Try a different search term' : 'No contacts available on this device'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Contacts" subtitle={`${filteredContacts.length} contacts`} />

      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search contacts..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <View style={[styles.counterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.counterText, { color: colors.textSecondary }]}>
          {filteredContacts.length} of {contacts.length} contacts
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading contacts...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={filteredContacts.length === 0 ? styles.emptyList : undefined}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  counterBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  noNumber: {
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
  },
  copyButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});
