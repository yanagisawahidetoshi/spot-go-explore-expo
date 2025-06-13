import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants';
import { t, Language } from '@/utils/translations';

interface PermissionModalProps {
  language: Language;
  onRequestPermission: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  language,
  onRequestPermission,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={60} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>{t('locationPermission', language)}</Text>
          <Text style={styles.description}>
            {t('locationPermissionDesc', language)}
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={onRequestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('enable', language)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PermissionModal;