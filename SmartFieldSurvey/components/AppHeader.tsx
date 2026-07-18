import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showMenu?: boolean;
  onMenuPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
}

export default function AppHeader({
  title = 'Smart Field Survey',
  subtitle,
  showMenu = true,
  onMenuPress,
  rightIcon,
  onRightPress,
}: AppHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.leftSection}>
        {showMenu && (
          <Pressable
            onPress={onMenuPress}
            style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
          >
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      <View style={styles.centerSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="map" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightIcon && (
          <Pressable
            onPress={onRightPress}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name={rightIcon as any} size={24} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  menuButton: {
    padding: 8,
  },
  iconButton: {
    padding: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
