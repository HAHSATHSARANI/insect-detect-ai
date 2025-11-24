import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts, getFontStyle } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    markAsRead();
    
    // Set up polling for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const loadMessages = async () => {
    try {
      const data = await api.chat.getMessages(id as string);
      setMessages(data);
      
      // Get conversation details from the first message or API
      if (data.length > 0) {
        // For now, we'll create a mock conversation object
        // In a real app, you'd fetch this from the conversations endpoint
        setConversation({
          id: id,
          title: 'Conversation', // You might want to fetch this properly
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert(t('common.error'), 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.chat.markAsRead(id as string);
    } catch (error) {
      console.log('Could not mark as read');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (!userJson) {
        Alert.alert(t('common.error'), 'Please login first');
        return;
      }
      
      const user = JSON.parse(userJson);
      const message = await api.chat.sendMessage(id as string, {
        conversationId: id as string,
        userId: user.id,
        content: newMessage,
        sender: 'user'
      });
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert(t('common.error'), 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.sender === 'user';
    const time = new Date(item.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.adminMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.adminBubble]}>
          <Text style={[
            styles.messageText, 
            getFontStyle('regular', 16, lang),
            isUser ? styles.userMessageText : styles.adminMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime, 
            getFontStyle('regular', 12, lang),
            isUser ? styles.userTimeText : styles.adminTimeText
          ]}>
            {time}
          </Text>
        </View>
        {!isUser && (
          <View style={styles.adminIndicator}>
            <Feather name="shield" size={16} color="#3A8A55" />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A8A55" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, getFontStyle('bold', 18, 'en')]}>
            {conversation?.title || 'Chat'}
          </Text>
          <Text style={[styles.headerSubtitle, getFontStyle('regular', 14, lang)]}>
            {t('community.expertSupport')}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.messageInput, getFontStyle('regular', 16, lang)]}
          placeholder={t('community.typeMessage')}
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!newMessage.trim() || sending) && { opacity: 0.5 }]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Feather name="send" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#222',
  },
  headerSubtitle: {
    color: '#666',
    marginTop: 2,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  adminMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    position: 'relative',
  },
  userBubble: {
    backgroundColor: '#3A8A55',
    borderBottomRightRadius: 5,
  },
  adminBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  adminMessageText: {
    color: '#333',
  },
  messageTime: {
    marginTop: 5,
    opacity: 0.7,
  },
  userTimeText: {
    color: '#FFFFFF',
  },
  adminTimeText: {
    color: '#666',
  },
  adminIndicator: {
    position: 'absolute',
    bottom: 5,
    left: -5,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#3A8A55',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
