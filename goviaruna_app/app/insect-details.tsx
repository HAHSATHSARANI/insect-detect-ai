import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';

const { width, height } = Dimensions.get('window');

const INSECT_DETAILS = {
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
};

export default function InsectDetailsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <PagerView style={styles.pagerView} initialPage={0}>
            {INSECT_DETAILS.images.map((img, index) => (
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
            <Text style={styles.title}>{INSECT_DETAILS.name}</Text>
            <View style={styles.tagContainer}>
              <Feather name="alert-triangle" size={16} color="#EF4444" />
              <Text style={styles.tagText}>හානිකරයි</Text>
            </View>
          </View>
          <Text style={styles.scientificName}>{INSECT_DETAILS.scientificName}</Text>
          
          <Text style={styles.detailText}><Text style={styles.detailLabel}>විද්‍යාත්මක නම :</Text> {INSECT_DETAILS.scientificNameFull}</Text>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>කුලය :</Text> {INSECT_DETAILS.family}</Text>
          
          <Text style={styles.description}>{INSECT_DETAILS.description}</Text>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {INSECT_DETAILS.tabs.map((tab, index) => (
              <TouchableOpacity key={index} onPress={() => setActiveTab(index)} style={[styles.tab, activeTab === index && styles.activeTab]}>
                <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Related Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{INSECT_DETAILS.relatedImagesTitle}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {INSECT_DETAILS.images.map((img, index) => (
                <Image key={index} source={img} style={styles.relatedImage} />
              ))}
            </ScrollView>
          </View>

          {/* Accordion Sections */}
          <View style={styles.section}>
            <Accordion title={INSECT_DETAILS.lifeCycleTitle} content={INSECT_DETAILS.lifeCycleContent} />
            <Accordion title={INSECT_DETAILS.damageSymptomsTitle} content={INSECT_DETAILS.damageSymptomsContent} />
            <Accordion title={INSECT_DETAILS.controlMethodsTitle} content={INSECT_DETAILS.controlMethodsContent} />
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
});
