import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { theme } from '@/constants/theme';
import { useAiStore, ChatMessage } from '@/stores/aiStore';
import { useAuthStore } from '@/stores/authStore';

const THINKING_PHRASES = [
  'Crunching the numbers...',
  'Consulting my spreadsheets...',
  'Asking the money gods...',
  'Calculating your life choices...',
  'Pretending to be a CFO...',
  'Doing math (yikes)...',
  'Checking under the couch cushions...',
  'Bribing the data...',
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
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ]),
      );

    const a1 = bounce(dot1, 0);
    const a2 = bounce(dot2, 150);
    const a3 = bounce(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.typingWrapper}>
      <View style={styles.typingRow}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
      <Text style={styles.typingPhrase}>{phrase}</Text>
    </View>
  );
}

type SuggestedPrompt = { label: string; prompt: string; llm?: boolean };

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { label: 'My balance', prompt: 'How much money do I have across my wallets?' },
  { label: 'Top spending', prompt: 'Where did I spend the most in the last 30 days?' },
  { label: 'Budget status', prompt: 'How am I doing on my budgets?' },
  { label: 'Goal progress', prompt: 'How is my progress on my savings goals?' },
  { label: 'Any tips?', prompt: 'Give me one short, actionable tip based on my finances.', llm: true },
  { label: 'What to watch', prompt: 'Is there anything concerning in my spending I should watch?', llm: true },
];

const LLM_COOLDOWN_MS = 30_000;

export default function AiChatScreen() {
  const router = useRouter();
  const { chatHistory, isTyping, sendMessage, clearChat, loadChatHistory } = useAiStore();
  const user = useAuthStore((s) => s.user);
  const flatListRef = useRef<FlatList>(null);
  const [llmCooldownUntil, setLlmCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (user?.id) {
      loadChatHistory(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (llmCooldownUntil <= now) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [llmCooldownUntil, now]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatHistory.length, isTyping]);

  const cooldownRemaining = Math.max(0, Math.ceil((llmCooldownUntil - now) / 1000));

  const handleBubble = (item: SuggestedPrompt) => {
    if (isTyping) return;
    if (item.llm && cooldownRemaining > 0) return;
    if (item.llm) {
      setLlmCooldownUntil(Date.now() + LLM_COOLDOWN_MS);
      setNow(Date.now());
    }
    sendMessage(item.prompt, user?.id);
  };

  const handleClear = () => {
    clearChat(user?.id);
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
        <TouchableOpacity onPress={handleClear}>
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

        <View style={styles.suggestionsWrap}>
          <Text style={styles.suggestionsHint}>
            {cooldownRemaining > 0
              ? `AI cooldown — ${cooldownRemaining}s remaining`
              : 'Tap a question to ask FinPal'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsRow}
          >
            {SUGGESTED_PROMPTS.map((item) => {
              const disabled = isTyping || (item.llm && cooldownRemaining > 0);
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.bubble, disabled && styles.bubbleDisabled]}
                  onPress={() => handleBubble(item)}
                  disabled={disabled}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bubbleText}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
  typingWrapper: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
    gap: 6,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  typingPhrase: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    paddingHorizontal: 4,
    fontStyle: 'italic',
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
  suggestionsWrap: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceLight,
    backgroundColor: theme.colors.background,
  },
  suggestionsHint: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  suggestionsRow: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    marginRight: theme.spacing.sm,
  },
  bubbleDisabled: {
    opacity: 0.4,
  },
  bubbleText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
});
