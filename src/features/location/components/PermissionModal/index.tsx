import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
} from 'react-native';
import { t, Language } from '@/features/language/utils/translations';
import { styles } from './styles';

interface Props {
  language: Language;
  onRequestPermission: () => void;
}

const PermissionModal: React.FC<Props> = ({
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
            <Text style={styles.icon}>📍</Text>
          </View>
          
          <Text style={styles.title}>{t('locationPermission', language)}</Text>
          <Text style={styles.description}>
            {t('locationPermissionDesc', language)}
          </Text>
          
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={onRequestPermission}
          >
            <Text style={styles.buttonText}>{t('enable', language)}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default PermissionModal;