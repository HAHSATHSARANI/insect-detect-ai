import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Fonts, getFontStyle } from '@/constants/Fonts';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';

export default function CommunityScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  const router = useRouter();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [newConversationMessage, setNewConversationMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const loadConversations = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        const data = await api.chat.getConversations(user.id);
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadConversations();
    }, [])
  );

  const handleCreateConversation = async () => {
    if (!newConversationTitle.trim() || !newConversationMessage.trim()) {
      Alert.alert(t('common.error'), 'Please fill in both title and message');
      return;
    }

    setCreating(true);
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (!userJson) {
        Alert.alert(t('common.error'), 'Please login first');
        return;
      }
      
      const user = JSON.parse(userJson);
      const conversation = await api.chat.createConversation({
        userId: user.id,
        title: newConversationTitle,
        initialMessage: newConversationMessage
      });
      
      setModalVisible(false);
      setNewConversationTitle('');
      setNewConversationMessage('');
      loadConversations();
      
      // Navigate to the new conversation
      router.push({ pathname: '/chat/[id]', params: { id: conversation.id } });
    } catch (error) {
      console.error('Create conversation error:', error);
      Alert.alert(t('common.error'), 'Failed to create conversation');
    } finally {
      setCreating(false);
    }
  };

  const handleConversationPress = (conversationId: string) => {
    router.push({ pathname: '/chat/[id]', params: { id: conversationId } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversation = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.conversationCard} 
      onPress={() => handleConversationPress(item.id)}
    >
      <View style={styles.conversationIcon}>
        <Feather name="message-circle" size={24} color="#3A8A55" />
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationTitle, getFontStyle('semiBold', 16, 'en')]}>{item.title}</Text>
          <Text style={[styles.conversationTime, getFontStyle('regular', 12, lang)]}>
            {item.lastMessageTime ? formatDate(item.lastMessageTime) : ''}
          </Text>
        </View>
        <Text style={[styles.lastMessage, getFontStyle('regular', 14, lang)]} numberOfLines={2}>
          {item.lastMessage || 'No messages yet'}
        </Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, getFontStyle('bold', 22, lang)]}>{t('community.title')}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Feather name="plus" size={24} color="#3A8A55" />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Feather name="message-circle" size={64} color="#CCC" />
          <Text style={[styles.emptyTitle, getFontStyle('semiBold', 20, lang)]}>{t('community.noConversations')}</Text>
          <Text style={[styles.emptySubtitle, getFontStyle('regular', 16, lang)]}>{t('community.startConversation')}</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setModalVisible(true)}>
            <Text style={[styles.startButtonText, getFontStyle('semiBold', 16, lang)]}>{t('community.startButton')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Create Conversation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, getFontStyle('bold', 18, lang)]}>{t('community.newConversation')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.titleInput, getFontStyle('regular', 16, 'en')]}
              placeholder="Conversation Title"
              placeholderTextColor="#999"
              value={newConversationTitle}
              onChangeText={setNewConversationTitle}
            />
            
            <TextInput
              style={[styles.messageInput, getFontStyle('regular', 16, lang)]}
              placeholder={t('community.yourMessage')}
              placeholderTextColor="#999"
              value={newConversationMessage}
              onChangeText={setNewConversationMessage}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, getFontStyle('semiBold', 16, lang)]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.createButton, creating && { opacity: 0.7 }]} 
                onPress={handleCreateConversation}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={[styles.createButtonText, getFontStyle('semiBold', 16, lang)]}>{t('collection.create')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    color: '#222222',
  },
  listContent: {
    padding: 20,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  conversationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  conversationContent: {
    flex: 1,
    position: 'relative',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  conversationTitle: {
    color: '#333',
    flex: 1,
  },
  conversationTime: {
    color: '#888',
    marginLeft: 10,
  },
  lastMessage: {
    color: '#666',
    lineHeight: 20,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#3A8A55',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#333',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#3A8A55',
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFF',
  },
});
