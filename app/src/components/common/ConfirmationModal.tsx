import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  X,
} from 'lucide-react-native';
import { useApp } from '../../store/AppContext';
import { GlowingIcon } from './GlowingIcon';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'info';
  singleAction?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'primary',
  singleAction = false,
}) => {
  const { theme, isDark } = useApp();

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          glowColor: theme.glowWarning,
          btnBg: theme.error,
          btnText: theme.textInverse,
          icon: <Trash2 size={24} color={theme.error} strokeWidth={2.2} />,
        };
      case 'success':
        return {
          glowColor: theme.glowSuccess,
          btnBg: theme.success,
          btnText: theme.textInverse,
          icon: <CheckCircle size={24} color={theme.success} strokeWidth={2.2} />,
        };
      case 'warning':
        return {
          glowColor: theme.glowWarning,
          btnBg: theme.warning,
          btnText: theme.textInverse,
          icon: <AlertTriangle size={24} color={theme.warning} strokeWidth={2.2} />,
        };
      case 'info':
        return {
          glowColor: theme.glowPrimary,
          btnBg: theme.info,
          btnText: theme.textInverse,
          icon: <Info size={24} color={theme.info} strokeWidth={2.2} />,
        };
      default:
        return {
          glowColor: theme.glowPrimary,
          btnBg: theme.primary,
          btnText: theme.textInverse,
          icon: <CheckCircle size={24} color={theme.primary} strokeWidth={2.2} />,
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity
            style={styles.closeBtn}
            activeOpacity={0.7}
            onPress={onCancel}
          >
            <X size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <GlowingIcon glowColor={currentVariant.glowColor} size={56} pulse>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDark
                      ? theme.surfaceVariant
                      : theme.primaryMuted,
                  },
                ]}
              >
                {currentVariant.icon}
              </View>
            </GlowingIcon>
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.actionsRow}>
            {!singleAction && (
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: isDark
                      ? theme.surfaceVariant
                      : theme.background,
                    borderColor: theme.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={onCancel}
              >
                <Text
                  style={[styles.cancelBtnText, { color: theme.textSecondary }]}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: currentVariant.btnBg },
                singleAction && styles.singleConfirmBtn,
              ]}
              activeOpacity={0.8}
              onPress={onConfirm}
            >
              <Text
                style={[
                  styles.confirmBtnText,
                  { color: currentVariant.btnText },
                ]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleConfirmBtn: {
    flex: 1,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
