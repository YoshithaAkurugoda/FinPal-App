import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { theme } from '@/constants/theme';
import { useAiStore, ChatMessage } from '@/stores/aiStore';

function TypingIndicator() {
  return (
    <View style={styles.typingRow}>
      <View style={styles.typingDot} />
      <View style={[styles.typingDot, { opacity: 0.6 }]} />
      <View style={[styles.typingDot, { opacity: 0.3 }]} />
    </View>
  );
}

export default function AiChatScreen() {
  const router = useRouter();
  const { chatHistory, isTyping, sendMessage, clearChat } = useAiStore();
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (chatHistory.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatHistory.length, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendMessage(text);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userText]}>
          {item.content}
        </Text>
        <Text style={styles.messageTime}>
          {format(new Date(item.createdAt), 'HH:mm')}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>AI Chat</Text>
        <TouchableOpacity onPress={clearChat}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={theme.colors.surfaceLight}
              />
              <Text style={styles.emptyText}>
                Ask me anything about your finances!
              </Text>
            </View>
          }
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !input.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  chatList: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  messageTime: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceLight,
    backgroundColor: theme.colors.background,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.xl,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
