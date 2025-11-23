import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import { api } from '@/services/api';

const { width, height } = Dimensions.get('window');

// Initial fallback data
const INITIAL_INSECT_DETAILS = {
  name: 'විශ්ලේෂණය කරමින්...',
  scientificName: '(Analyzing...)',
  commonName: '',
  scientificNameFull: '...',
  family: '...',
  description: 'රූපය විශ්ලේෂණය කරමින් පවතී. කරුණාකර රැඳී සිටින්න.',
  images: [],
  tabs: ['තොරතුරු', 'හානිය', 'පාලනය'],
  lifeCycleTitle: 'ජීවන චක්‍රය',
  lifeCycleContent: '...',
  damageSymptomsTitle: 'හානි ලක්ෂණ',
  damageSymptomsContent: '...',
  controlMethodsTitle: 'පාලන ක්‍රම',
  controlMethodsContent: '...',
  relatedImagesTitle: 'රූප',
};

export default function InsectDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(!!imageUri);
  const [details, setDetails] = useState<any>(imageUri ? INITIAL_INSECT_DETAILS : {
    name: 'දුඹුරු පැළ කීඩෑවා',
    scientificName: '(Brown PlantBopper)',
    commonName: 'දුඹුරු පැළ කීඩෑවා',
    scientificNameFull: 'Nilaparvata lugens',
    family: 'Lamiacese',
    description: 'දුඹුරු පැළ කීඩෑවා (BPH) යනු සුලභ පළිබෝධකයෙකි. එය වී වගාවට බරපතල හානි සිදු කරයි. මෙම කෘමියා (ගොයම් පලඟැටියා ලෙසද හැඳින්වේ) ශාකයේ යුෂ උරා බොන අතර, එය වෛරස් රෝග පැතිරවිය හැකිය. BPH ආසාදනය පාලනය නොකළහොත් සැලකිය යුතු අස්වැන්නක් අහිමි විය හැකිය.',
    images: [
      require('@/assets/images/insect_3.jpg'),
      require('@/assets/images/insect_3.jpg'),
      require('@/assets/images/insect_3.jpg'),
    ],
    tabs: ['තොරතුරු', 'හානිය', 'පාලනය'],
    lifeCycleTitle: 'ජීවන චක්‍රය',
    lifeCycleContent: 'ගැහැණු සතා බිත්තර දමන්නේ කොළ කොපුවල හෝ පත්‍ර තලයේ මැද නාරටිය මතය. බිත්තර දැමීමෙන් පසු දින 7-9 කින් පමණ පිපිරීම සිදුවේ. පැටවුන් දින 13-15 කින් පමණ වැඩෙයි.',
    damageSymptomsTitle: 'හානි ලක්ෂණ',
    damageSymptomsContent: 'පැළෑටිය කහ වීම, වර්ධනය බාල වීම සහ “හොපර් පිළිස්සීම” ලෙස හැඳින්වෙන වියළී යාමේ රෝග ලක්ෂණ පෙන්නුම් කරයි.',
    controlMethodsTitle: 'පාලන ක්‍රම',
    controlMethodsContent: 'ප්‍රතිරෝධී ප්‍රභේද භාවිතා කිරීම, කෘමිනාශක යෙදීම සහ ස්වභාවික සතුරන් දිරිමත් කිරීම වැනි ක්‍රම ඇතුළත් වේ.',
    relatedImagesTitle: 'රූප',
  });

  useEffect(() => {
    if (imageUri) {
      analyzeImage();
    }
  }, [imageUri]);

  const analyzeImage = async () => {
    try {
      const result = await api.insects.classify(imageUri);
      setDetails({
        ...INITIAL_INSECT_DETAILS,
        ...result,
        images: [
          // Try to use provided images if available, otherwise fallbacks
          require('@/assets/images/insect_3.jpg'),
          require('@/assets/images/insect_3.jpg')
        ] 
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('විශ්ලේෂණය අසාර්ථකයි', 'කරුණාකර නැවත උත්සාහ කරන්න');
    } finally {
      setLoading(false);
    }
  };
  
  // If we have a captured image, put it first in the list
  const displayImages = imageUri 
    ? [{ uri: imageUri }, ...(details.images || [])]
    : (details.images || []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3A8A55" />
          <Text style={styles.loadingText}>රූපය විශ්ලේෂණය කරමින්...</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <PagerView style={styles.pagerView} initialPage={0}>
            {displayImages.map((img: any, index: number) => (
              <View key={index}>
                <Image source={img} style={styles.image} />
              </View>
            ))}
          </PagerView>
          <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, styles.backButton]}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, styles.saveButton]}>
            <Feather name="bookmark" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>ගබඩා කරන්න</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{details.name}</Text>
            <View style={[
              styles.tagContainer, 
              details.category === 'Beneficial' ? styles.beneficialTag : styles.harmfulTag
            ]}>
              <Feather 
                name={details.category === 'Beneficial' ? "check-circle" : "alert-triangle"} 
                size={16} 
                color={details.category === 'Beneficial' ? "#059669" : "#EF4444"} 
              />
              <Text style={[
                styles.tagText,
                details.category === 'Beneficial' ? styles.beneficialText : styles.harmfulText
              ]}>
                {details.category === 'Beneficial' ? 'හිතකරයි' : 'හානිකරයි'}
              </Text>
            </View>
          </View>
          <Text style={styles.scientificName}>{details.scientificName}</Text>
          
          <Text style={styles.detailText}><Text style={styles.detailLabel}>විද්‍යාත්මක නම :</Text> {details.scientificNameFull}</Text>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>කුලය :</Text> {details.family}</Text>
          
          <Text style={styles.description}>{details.description}</Text>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {details.tabs.map((tab: string, index: number) => (
              <TouchableOpacity key={index} onPress={() => setActiveTab(index)} style={[styles.tab, activeTab === index && styles.activeTab]}>
                <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Related Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{details.relatedImagesTitle}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(details.images || []).map((img: any, index: number) => (
                <Image key={index} source={img} style={styles.relatedImage} />
              ))}
            </ScrollView>
          </View>

          {/* Accordion Sections */}
          <View style={styles.section}>
            <Accordion title={details.lifeCycleTitle} content={details.lifeCycleContent} />
            <Accordion title={details.damageSymptomsTitle} content={details.damageSymptomsContent} />
            <Accordion title={details.controlMethodsTitle} content={details.controlMethodsContent} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const Accordion = ({ title, content }: { title: string, content: string }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.accordionHeader}>
        <View style={styles.accordionIcon}>
          <Feather name="droplet" size={24} color="#3A8A55" />
        </View>
        <Text style={styles.accordionTitle}>{title}</Text>
        <Feather name="volume-2" size={24} color="#666" />
      </TouchableOpacity>
      {expanded && <Text style={styles.accordionContent}>{content}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  imageContainer: { height: height * 0.4, width: '100%' },
  pagerView: { flex: 1 },
  image: { width: '100%', height: '100%' },
  iconButton: { position: 'absolute', top: 60, padding: 10, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)' },
  backButton: { left: 20 },
  saveButton: { right: 20, flexDirection: 'row', alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', ...Fonts.styles.semiBold, marginLeft: 5 },
  contentContainer: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, backgroundColor: '#FFFFFF' },
  titleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  title: { ...Fonts.styles.bold, fontSize: 26, color: '#222' },
  tagContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tagText: { color: '#EF4444', ...Fonts.styles.semiBold, marginLeft: 5 },
  scientificName: { ...Fonts.styles.regular, fontSize: 16, color: '#888', marginBottom: 15 },
  detailText: { ...Fonts.styles.regular, fontSize: 15, color: '#555', marginBottom: 5 },
  detailLabel: { ...Fonts.styles.semiBold },
  description: { ...Fonts.styles.regular, fontSize: 15, color: '#555', lineHeight: 24, marginVertical: 15 },
  tabContainer: { flexDirection: 'row', marginBottom: 20 },
  tab: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#3A8A55' },
  tabText: { ...Fonts.styles.semiBold, fontSize: 16, color: '#888' },
  activeTabText: { color: '#3A8A55' },
  section: { marginTop: 20 },
  sectionTitle: { ...Fonts.styles.bold, fontSize: 20, color: '#222', marginBottom: 15 },
  relatedImage: { width: 100, height: 100, borderRadius: 10, marginRight: 10 },
  accordionContainer: { backgroundColor: '#F8F9FA', borderRadius: 15, padding: 15, marginBottom: 15 },
  accordionHeader: { flexDirection: 'row', alignItems: 'center' },
  accordionIcon: { backgroundColor: '#E8F5E9', padding: 12, borderRadius: 25, marginRight: 15 },
  accordionTitle: { flex: 1, ...Fonts.styles.bold, fontSize: 18, color: '#333' },
  accordionContent: { ...Fonts.styles.regular, fontSize: 15, color: '#555', lineHeight: 24, marginTop: 15 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Fonts.styles.semiBold,
    fontSize: 18,
    color: '#3A8A55',
    marginTop: 20,
  },
  harmfulTag: {
    backgroundColor: '#FEE2E2',
  },
  beneficialTag: {
    backgroundColor: '#D1FAE5',
  },
  harmfulText: {
    color: '#EF4444',
  },
  beneficialText: {
    color: '#059669',
  },
});
