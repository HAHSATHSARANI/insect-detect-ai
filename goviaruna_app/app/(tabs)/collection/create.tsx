import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Text, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { api } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sinhala locale config for the calendar
LocaleConfig.locales['si'] = {
  monthNames: ['ජනවාරි','පෙබරවාරි','මාර්තු','අප්‍රේල්','මැයි','ජූනි','ජූලි','අගෝස්තු','සැප්තැම්බර්','ඔක්තෝබර්','නොවැම්බර්','දෙසැම්බර්'],
  monthNamesShort: ['ජන','පෙබ','මාර්','අප්‍රේල්','මැයි','ජූනි','ජූලි','අගෝ','සැප්','ඔක්','නොවැ','දෙසැ'],
  dayNames: ['ඉරිදා','සඳුදා','අඟහරුවාදා','බදාදා','බ්‍රහස්පතින්දා','සිකුරාදා','සෙනසුරාදා'],
  dayNamesShort: ['සඳු','අඟ','බදා','බ්‍රහ','සිකු','සෙ','ඉරි'],
  today: 'අද'
};
LocaleConfig.defaultLocale = 'si';

const CREATE_COLLECTION_CONTENT = {
  title: 'එකතුව එකතු කරන්න',
  inputPlaceholder: 'එකතුවේ නම ඇතුලත් කරන්න',
  cancelButton: 'අවලංගු කරන්න',
  createButton: 'නිර්මාණය කරන්න',
};

export default function CreateCollectionScreen() {
  const router = useRouter();
  const [collectionName, setCollectionName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!collectionName) {
      Alert.alert('දෝෂයකි', 'කරුණාකර එකතුවේ නම ඇතුලත් කරන්න');
      return;
    }

    setLoading(true);
    try {
      // Assuming we store user info in AsyncStorage after login. 
      // For now, we need to fetch the userId. 
      // TODO: Implement proper user context/storage.
      // Using a temporary method to get userId if stored, or prompt login.
      
      // For demonstration, let's assume we can get the user from a previous login response 
      // that we stored. If not, we might need to fetch /me or decode token.
      // Let's try to get it from AsyncStorage 'user' key if we saved it.
      
      // NOTE: In a real app, use a Context or State Management for the User.
      // I'll add a placeholder here. The backend requires userId.
      
      // TEMPORARY: Fetch user from local storage (assuming we saved it on login)
      const userJson = await AsyncStorage.getItem('user');
      let userId = '';
      if (userJson) {
        const user = JSON.parse(userJson);
        userId = user.id;
      } else {
        // Fallback or error if not logged in
        // For testing without login persistence, we might fail.
        Alert.alert('දෝෂයකි', 'කරුණාකර නැවත ඇතුල් වන්න');
        setLoading(false);
        return;
      }

      await api.collections.create({
        name: collectionName,
        userId: userId,
        description: selectedDate ? `Created for date: ${selectedDate}` : ''
      });
      
      Alert.alert('සාර්ථකයි', 'එකතුව සාර්ථකව නිර්මාණය කරන ලදී', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Create collection error:', error);
      Alert.alert('අසාර්ථකයි', 'එකතුව නිර්මාණය කිරීම අසාර්ථක විය');
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
        <Text style={styles.headerTitle}>{CREATE_COLLECTION_CONTENT.title}</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.input}
          placeholder={CREATE_COLLECTION_CONTENT.inputPlaceholder}
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

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>{CREATE_COLLECTION_CONTENT.cancelButton}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.createButton, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
             <Text style={styles.buttonText}>{CREATE_COLLECTION_CONTENT.createButton}</Text>
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
    ...Fonts.styles.bold,
    fontSize: 22,
    color: '#222222',
  },
  backButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  input: {
    ...Fonts.styles.regular,
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
    ...Fonts.styles.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#333333',
  },
});
