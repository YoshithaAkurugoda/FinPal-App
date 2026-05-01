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
  Alert,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { theme } from '@/constants/theme';
import { useAiStore, ChatMessage } from '@/stores/aiStore';
import { useAuthStore } from '@/stores/authStore';

const evaLogo = require('@/assets/eva-logo.jpeg');

const QUICK_PROMPTS = [
  'How am I doing this month?',
  'What are my top expenses?',
  'Am I on track with my goals?',
  'Where can I save more?',
];

function EvaAvatar({ size = 30 }: { size?: number }) {
  const [imgError, setImgError] = useState(false);
  return (
    <View style={[styles.aiAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {imgError ? (
        <Ionicons name="sparkles" size={size * 0.47} color={theme.colors.primary} />
      ) : (
        <Image
          source={evaLogo}
          style={{ width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375 }}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      )}
    </View>
  );
}

const THINKING_PHRASES = [
  'Crunching the numbers...',
  'Consulting my spreadsheets...',
  'Asking the money gods...',
  'Calculating your life choices...',
  'Pretending to be a CFO...',
  'Doing math (yikes)...',
  'Checking under the couch cushions...',
  'Bribing the data...',
  'Summoning financial wisdom...',
  'Reading the market tea leaves...',
];

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const [phrase] = useState(
    () => THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)],
  );

  useEffect(() => {
    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(580),
        ]),
      );

    const a1 = bounce(dot1, 0);
    const a2 = bounce(dot2, 140);
    const a3 = bounce(dot3, 280);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.aiBubbleWrapper}>
      <EvaAvatar />
      <View style={styles.aiBubbleColumn}>
        <Text style={styles.aiLabel}>EVA</Text>
        <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
          <View style={styles.typingRow}>
            {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View
                key={i}
                style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
              />
            ))}
          </View>
        </View>
        <Text style={styles.typingPhrase}>{phrase}</Text>
      </View>
    </View>
  );
}

function MessageBubble({ item }: { item: ChatMessage }) {
  const isUser = item.role === 'user';
  if (isUser) {
    return (
      <View style={styles.userBubbleWrapper}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.userBubbleText}>{item.content}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.aiBubbleWrapper}>
      <EvaAvatar />
      <View style={styles.aiBubbleColumn}>
        <Text style={styles.aiLabel}>EVA</Text>
        <View style={[styles.bubble, styles.aiBubble]}>
          <Text style={styles.aiBubbleText}>{item.content}</Text>
          <Text style={styles.bubbleTime}>{format(new Date(item.createdAt), 'HH:mm')}</Text>
        </View>
      </View>
    </View>
  );
}

export default function AiInsightsTab() {
  const { chatHistory, isTyping, sendMessage, clearChat, loadChatHistory } = useAiStore();
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const firstName = user?.name?.split(' ')[0] ?? 'User';

  useEffect(() => {
    if (user?.id) loadChatHistory(user.id);
  }, [user?.id]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatHistory.length, isTyping]);

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    sendMessage(msg, user?.id);
  };

  const handleClear = () => {
    Alert.alert('Clear Chat', 'Delete all chat history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearChat(user?.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <EvaAvatar size={42} />
          <View>
            <Text style={styles.headerName}>Eva</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>YOUR FINANCE COMPANION</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleClear}
          style={styles.headerAction}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.textSecondary} />
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
          renderItem={({ item }) => <MessageBubble item={item} />}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <EvaAvatar size={72} />
              </View>
              <Text style={styles.emptyTitle}>Hi, I'm Eva</Text>
              <Text style={styles.emptySubtitle}>
                Ask me anything about your finances, spending habits, or savings goals.
              </Text>
              <View style={styles.quickPrompts}>
                {QUICK_PROMPTS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={styles.quickPrompt}
                    onPress={() => handleSend(p)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickPromptText}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask your AI coach..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!input.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 2,
    borderColor: theme.colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Chat
  chatList: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    flexGrow: 1,
  },

  aiBubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    gap: 8,
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  aiBubbleColumn: {
    flex: 1,
    gap: 4,
  },
  aiLabel: {
    color: theme.colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  bubble: {
    maxWidth: '90%',
    borderRadius: theme.borderRadius.lg,
    padding: 14,
  },
  aiBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  aiBubbleText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },

  userBubbleWrapper: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  userBubble: {
    backgroundColor: theme.colors.surfaceMid,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    borderTopRightRadius: 4,
    maxWidth: '80%',
  },
  userBubbleText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },

  bubbleTime: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },

  typingBubble: { paddingVertical: 14 },
  typingRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'flex-end',
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.primary,
  },
  typingPhrase: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontStyle: 'italic',
    paddingHorizontal: 2,
    marginTop: 2,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  quickPrompts: {
    width: '100%',
    gap: 8,
  },
  quickPrompt: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: 12,
  },
  quickPromptText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },

  // Input
  inputContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceLight,
    backgroundColor: theme.colors.background,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    gap: 6,
  },
  textInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
