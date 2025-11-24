import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Text, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts, getFontStyle } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { api } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

// Sinhala locale config for the calendar
LocaleConfig.locales['si'] = {
  monthNames: ['ජනවාරි','පෙබරවාරි','මාර්තු','අප්‍රේල්','මැයි','ජූනි','ජූලි','අගෝස්තු','සැප්තැම්බර්','ඔක්තෝබර්','නොවැම්බර්','දෙසැම්බර්'],
  monthNamesShort: ['ජන','පෙබ','මාර්','අප්‍රේල්','මැයි','ජූනි','ජූලි','අගෝ','සැප්','ඔක්','නොවැ','දෙසැ'],
  dayNames: ['ඉරිදා','සඳුදා','අඟහරුවාදා','බදාදා','බ්‍රහස්පතින්දා','සිකුරාදා','සෙනසුරාදා'],
  dayNamesShort: ['සඳු','අඟ','බදා','බ්‍රහ','සිකු','සෙ','ඉරි'],
  today: 'අද'
};
LocaleConfig.defaultLocale = 'si';

export default function CreateCollectionScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  const params = useLocalSearchParams();
  const collectionId = params.id as string;
  const isEditing = !!collectionId;

  const [collectionName, setCollectionName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (lang === 'en') {
      LocaleConfig.defaultLocale = 'en';
    } else {
      LocaleConfig.defaultLocale = 'si';
    }
  }, [lang]);

  useEffect(() => {
    if (isEditing) {
      loadCollectionDetails();
    }
  }, [collectionId]);

  const loadCollectionDetails = async () => {
    try {
      const userIdJson = await AsyncStorage.getItem('user');
      if (!userIdJson) {
        // Basic error handling, though in real app we'd have context
        return; 
      }
      const user = JSON.parse(userIdJson);
      const collections = await api.collections.getUserCollections(user.id);
      const collection = collections.find((c: any) => c.id === collectionId);
      
      if (collection) {
        setCollectionName(collection.name);
        if (collection.date) {
          // Assuming date comes as ISO string or similar that we can parse
          const dateObj = new Date(collection.date);
          const dateStr = dateObj.toISOString().split('T')[0];
          setSelectedDate(dateStr);
          setCurrentMonth(dateObj);
        }
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!collectionName) {
      Alert.alert(t('common.error'), t('collection.input_placeholder'));
      return;
    }

    setLoading(true);
    try {
      const userJson = await AsyncStorage.getItem('user');
      let userId = '';
      if (userJson) {
        const user = JSON.parse(userJson);
        userId = user.id;
      } else {
        Alert.alert(t('common.error'), t('auth.login'));
        setLoading(false);
        return;
      }

      const payload = {
        name: collectionName,
        userId: userId,
        date: selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString(),
        description: '' // Optional
      };

      if (isEditing) {
        await api.collections.update(collectionId, payload);
        Alert.alert(t('common.success'), t('common.success'), [
          { text: t('common.ok'), onPress: () => router.back() }
        ]);
      } else {
        await api.collections.create(payload);
        Alert.alert(t('common.success'), t('common.success'), [
          { text: t('common.ok'), onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('Save collection error:', error);
      Alert.alert(t('common.error'), isEditing ? t('common.error') : t('common.error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleMonthChange = (add: boolean) => {
    const newMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() + (add ? 1 : -1)));
    setCurrentMonth(newMonth);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#222222" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, getFontStyle('bold', 22, lang)]}>{isEditing ? t('collection.edit') : t('collection.create_title')}</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {initialLoading ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#3A8A55" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TextInput
            style={[styles.input, getFontStyle('regular', 16, 'en')]}
            placeholder={t('collection.input_placeholder')}
            placeholderTextColor="#999"
            value={collectionName}
            onChangeText={setCollectionName}
          />
          
          <Calendar
            key={currentMonth.toISOString()} // Force re-render on month change
            current={currentMonth.toISOString().split('T')[0]}
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {selected: true, disableTouchEvent: true, selectedColor: '#3A8A55', selectedTextColor: '#FFFFFF'}
            }}
            theme={calendarTheme}
            renderArrow={(direction) => 
              <TouchableOpacity onPress={() => handleMonthChange(direction === 'right')}>
                <Feather name={direction === 'left' ? 'chevron-left' : 'chevron-right'} size={24} color="#3A8A55" />
              </TouchableOpacity>
            }
            hideExtraDays={true}
            monthFormat={'MMMM yyyy'}
            onMonthChange={(month) => {
              setCurrentMonth(new Date(month.timestamp));
            }}
          />
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText, getFontStyle('semiBold', 16, lang)]}>{t('collection.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.createButton, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          activeOpacity={0.8}
          disabled={loading || initialLoading}
        >
          {loading ? (
             <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
             <Text style={[styles.buttonText, getFontStyle('semiBold', 16, lang)]}>
               {isEditing ? t('collection.update') : t('collection.create')}
             </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const calendarTheme = {
  backgroundColor: '#FFFFFF',
  calendarBackground: '#FFFFFF',
  textSectionTitleColor: '#333333',
  selectedDayBackgroundColor: '#3A8A55',
  selectedDayTextColor: '#FFFFFF',
  todayTextColor: '#3A8A55',
  dayTextColor: '#2d4150',
  textDisabledColor: '#d9e1e8',
  arrowColor: '#3A8A55',
  monthTextColor: '#222222',
  textDayFontFamily: Fonts.semiBold,
  textMonthFontFamily: Fonts.bold,
  textDayHeaderFontFamily: Fonts.semiBold,
  textDayFontSize: 15,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 14,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    color: '#222222',
  },
  backButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  input: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 25,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginRight: 10,
  },
  createButton: {
    backgroundColor: '#3A8A55',
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#333333',
  },
});
