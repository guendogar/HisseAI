import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const CreateListModal: React.FC<CreateListModalProps> = ({ visible, onClose, onCreate }) => {
  const colors = useColors();
  const [name, setName] = useState('');

  const handleCreate = useCallback(() => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
    onClose();
  }, [name, onCreate, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Yeni Liste</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
            placeholder="Liste adı..."
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.surfaceElevated }]}
              onPress={onClose}
            >
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: name.trim() ? colors.primary : colors.border }]}
              onPress={handleCreate}
              disabled={!name.trim()}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    width: '85%',
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSizes.base,
  },
  btnRow: { flexDirection: 'row', gap: Spacing.sm },
  btn: { flex: 1, paddingVertical: Spacing.sm + 2, borderRadius: 10, alignItems: 'center' },
  btnText: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold },
});

export default CreateListModal;
