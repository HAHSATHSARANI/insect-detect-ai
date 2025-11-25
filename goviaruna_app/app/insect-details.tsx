import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts, getFontStyle } from '@/constants/Fonts';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import { api, API_URL } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTTS } from '@/hooks/useTTS';

const { width, height } = Dimensions.get('window');

export default function InsectDetailsScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const savedDataStr = params.savedData as string;

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(!savedDataStr && !!imageUri);
  const [error, setError] = useState<string | null>(null);
  const [notIdentified, setNotIdentified] = useState(false);

  const INITIAL_INSECT_DETAILS = {
    name: t('insect_details.analyzing'),
    scientificName: '(Analyzing...)',
    commonName: '',
    scientificNameFull: '...',
    family: '...',
    description: t('insect_details.analyzing'),
    images: [],
    tabs: [t('insect_details.info'), t('insect_details.damage'), t('insect_details.control')],
    lifeCycleTitle: t('insect_details.lifecycle'),
    lifeCycleContent: '...',
    damageSymptomsTitle: t('insect_details.damage_symptoms'),
    damageSymptomsContent: '...',
    controlMethodsTitle: t('insect_details.control_methods'),
    controlMethodsContent: '...',
    relatedImagesTitle: t('insect_details.images'),
  };

  const [details, setDetails] = useState<any>(INITIAL_INSECT_DETAILS);
  const [modalVisible, setModalVisible] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [dataMissing, setDataMissing] = useState(false);
  const { speak, stop, speakingId } = useTTS();

  useEffect(() => {
    // Update initial details when language changes
    setDetails((prev: any) => ({
      ...prev,
      tabs: [t('insect_details.info'), t('insect_details.damage'), t('insect_details.control')],
      lifeCycleTitle: t('insect_details.lifecycle'),
      damageSymptomsTitle: t('insect_details.damage_symptoms'),
      controlMethodsTitle: t('insect_details.control_methods'),
      relatedImagesTitle: t('insect_details.images'),
    }));
  }, [lang]);

  useEffect(() => {
    if (savedDataStr) {
      // If viewing saved data, use it directly
      try {
        const saved = JSON.parse(savedDataStr);
        const insectData = saved.insectData || {};
        setDetails({
          ...INITIAL_INSECT_DETAILS,
          ...insectData,
          // Ensure we show the saved image if available
          images: saved.imageUrl ? [] : insectData.images // Assuming logic to show main image separately
        });
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
      setLoading(false);
    } else if (imageUri) {
      analyzeImage();
    }
  }, [imageUri, savedDataStr]);

  const analyzeImage = async () => {
    try {
      const result = await api.insects.classify(imageUri);

      // Check if the insect was identified or not
      if (result.category === 'Unknown' || result.name === "හඳුනාගත නොහැක") {
        setNotIdentified(true);
        setLoading(false);
        return;
      }

      // Check if identified but data missing in DB
      if (result.category === 'DataMissing') {
        setDetails((prev: any) => ({
          ...prev,
          ...result, // Contains processedImage
        }));
        setDataMissing(true);
        setLoading(false);
        return;
      }

      setDetails((prev: any) => ({
        ...prev,
        ...result,
        images: [
          // Try to use provided images if available, otherwise fallbacks
          require('@/assets/images/insect_3.jpg'),
          require('@/assets/images/insect_3.jpg')
        ]
      }));
    } catch (error) {
      // The console.error below was causing the intrusive bottom pop-up.
      // Since we now have a custom modal, this is no longer needed.
      // console.error('Analysis failed:', error);
      setError(t('insect_details.retry', 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleSavePress = async () => {
    if (savedDataStr) return; // Already saved/viewing mode

    try {
      const userJson = await AsyncStorage.getItem('user');
      if (!userJson) {
        Alert.alert(t('common.error'), t('auth.login')); // Prompt login
        return;
      }
      const user = JSON.parse(userJson);
      const cols = await api.collections.getUserCollections(user.id);
      setCollections(cols);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching collections', error);
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const saveToCollection = async (collectionId: string) => {
    setSaving(true);
    try {
      // 1. Upload Image
      let uploadedImageId = null;
      if (imageUri) {
        const uploadResult = await api.collections.uploadImage(imageUri);
        uploadedImageId = uploadResult.fileId;
      }

      // 2. Add Item
      const itemData = {
        insectName: details.name,
        scientificName: details.scientificNameFull || details.scientificName,
        imageUrl: uploadedImageId,
        confidence: details.confidence || 0,
        category: details.category || 'Unknown',
        insectData: details
      };

      await api.collections.addItem(collectionId, itemData);

      setModalVisible(false);
      Alert.alert(t('common.success'), t('insect_details.saved_success'));
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(t('common.error'), t('insect_details.saved_fail'));
    } finally {
      setSaving(false);
    }
  };

  // If we have a processed image with bounding boxes, use it; otherwise use original captured image
  const getMainImage = () => {
    if (details.processedImage) {
      // Use the processed image with bounding boxes from the API response
      return { uri: `data:image/jpeg;base64,${details.processedImage}` };
    } else if (imageUri) {
      // Fall back to original captured image
      return { uri: imageUri };
    }
    return null;
  };

  const mainImage = getMainImage();

  // Convert DB image IDs to full URLs
  const dbImages = (details.images || []).map((img: string | any) => {
    if (typeof img === 'string' && !img.startsWith('http') && !img.startsWith('data:') && !img.startsWith('file:')) {
      // It's likely an ID from the database
      return { uri: `${API_URL}/api/insects/image/${img}` };
    }
    // Handle if img is already an object (e.g. from local require) or a full URL
    if (typeof img === 'object' && img !== null) return img;

    return { uri: img };
  });

  const displayImages = mainImage
    ? [mainImage, ...dbImages]
    : dbImages;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Network Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!error}
        onRequestClose={() => setError(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorContainer}>
            <Feather name="alert-triangle" size={48} color="#D9534F" />
            <Text style={[styles.errorTitle, getFontStyle('bold', 20, 'si')]}>
              {t('insect_details.analysis_fail', 'Analysis Failed')}
            </Text>
            <Text style={[styles.errorMessage, getFontStyle('regular', 16, 'si')]}>
              {error}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
                analyzeImage();
              }}
            >
              <Text style={[styles.retryButtonText, getFontStyle('semiBold', 16, 'si')]}>
                {t('common.try_again', 'Try Again')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setError(null);
                if (router.canGoBack()) router.back();
              }}
            >
              <Text style={[styles.cancelButtonText, getFontStyle('regular', 16, 'si')]}>
                {t('common.cancel', 'Cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Not Identified Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={notIdentified}
        onRequestClose={() => setNotIdentified(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorContainer}>
            <Feather name="search" size={48} color="#3A8A55" />
            <Text style={[styles.errorTitle, getFontStyle('bold', 20, 'si')]}>
              {t('insect_details.not_identified_title', 'Cannot Identify')}
            </Text>
            <Text style={[styles.errorMessage, getFontStyle('regular', 16, 'si')]}>
              {t('insect_details.not_identified_message', 'We could not identify an insect in the photo. Please try again with a clearer image.')}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setNotIdentified(false);
                if (router.canGoBack()) router.back();
              }}
            >
              <Text style={[styles.retryButtonText, getFontStyle('semiBold', 16, 'si')]}>
                {t('insect_details.go_back', 'Go Back')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Data Missing Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={dataMissing}
        onRequestClose={() => setDataMissing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorContainer}>
            <Feather name="database" size={48} color="#F59E0B" />
            <Text style={[styles.errorTitle, getFontStyle('bold', 20, 'si')]}>
              {t('insect_details.data_missing_title', 'Data Unavailable')}
            </Text>
            <Text style={[styles.errorMessage, getFontStyle('regular', 16, 'si')]}>
              {t('insect_details.data_missing_message', 'This insect was detected, but detailed information is not yet available in our database.')}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setDataMissing(false);
                if (router.canGoBack()) router.back();
              }}
            >
              <Text style={[styles.retryButtonText, getFontStyle('semiBold', 16, 'si')]}>
                {t('insect_details.go_back', 'Go Back')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3A8A55" />
          <Text style={[styles.loadingText, getFontStyle('semiBold', 18, 'si')]}>{t('insect_details.analyzing')}</Text>
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

          {!savedDataStr && (
            <TouchableOpacity onPress={handleSavePress} style={[styles.iconButton, styles.saveButton]}>
              <Feather name="bookmark" size={24} color="#FFFFFF" />
              <Text style={[styles.saveButtonText, getFontStyle('semiBold', 14, 'si')]}>{t('insect_details.save')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, getFontStyle('bold', 26, 'si')]}>{details.name}</Text>
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
                getFontStyle('semiBold', 14, 'si'),
                details.category === 'Beneficial' ? styles.beneficialText : styles.harmfulText
              ]}>
                {details.category === 'Beneficial' ? t('insect_details.beneficial') : t('insect_details.harmful')}
              </Text>
            </View>
          </View>
          {/* Header Details */}
          <View style={styles.headerDetailsContainer}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, getFontStyle('semiBold', 15, 'si')]}>{t('insect_details.scientific_name')} : </Text>
              <Text style={[styles.detailValue, getFontStyle('regular', 15, 'si')]}>{details.scientificNameFull || details.scientificName}</Text>
            </View>

            {details.family && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, getFontStyle('semiBold', 15, 'si')]}>{t('insect_details.family')} : </Text>
                <Text style={[styles.detailValue, getFontStyle('regular', 15, 'si')]}>{details.family}</Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={[styles.description, getFontStyle('regular', 15, 'si'), { marginBottom: 0, flex: 1 }]}>{details.description}</Text>
            <TouchableOpacity
              onPress={() => speak(details.description, 'description', lang)}
              style={{ marginLeft: 10, padding: 10, backgroundColor: '#F0FDF4', borderRadius: 20 }}
            >
              <Feather name={speakingId === 'description' ? "square" : "volume-2"} size={24} color="#059669" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {details.tabs.map((tab: string, index: number) => (
              <TouchableOpacity key={index} onPress={() => setActiveTab(index)} style={[styles.tab, activeTab === index && styles.activeTab]}>
                <Text style={[
                  styles.tabText,
                  getFontStyle('semiBold', 16, 'si'),
                  activeTab === index && styles.activeTabText
                ]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content based on active tab */}

          {/* INFO TAB */}
          {activeTab === 0 && (
            <>
              {/* Related Images */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, getFontStyle('bold', 20, 'si')]}>{details.relatedImagesTitle}</Text>
                {dbImages && dbImages.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {dbImages.map((img: any, index: number) => (
                      <Image key={index} source={img} style={styles.relatedImage} />
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={[styles.emptyText, getFontStyle('regular', 14, 'si')]}>No images available</Text>
                )}
              </View>

              {/* Life Cycle */}
              {details.lifeCycleContent && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, getFontStyle('bold', 20, 'si')]}>{details.lifeCycleTitle || t('insect_details.lifecycle')}</Text>
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
                        <MaterialCommunityIcons name="leaf-circle" size={24} color="white" />
                      </View>
                      <Text style={[styles.cardTitle, getFontStyle('bold', 18, 'si')]}>{details.lifeCycleTitle || t('insect_details.lifecycle')}</Text>
                      <TouchableOpacity onPress={() => speak(details.lifeCycleContent, 'lifecycle', lang)}>
                        <Feather name={speakingId === 'lifecycle' ? "square" : "volume-2"} size={20} color="#059669" />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.cardContent, getFontStyle('regular', 15, 'si')]}>{details.lifeCycleContent}</Text>
                  </View>
                </View>
              )}

              {/* Additional Notes */}
              {details.additionalNotes && (
                <View style={[styles.infoCard, { marginTop: 20, backgroundColor: '#F0FDF4' }]}>
                  <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
                    <MaterialCommunityIcons name="information-variant" size={24} color="white" />
                  </View>
                  <View style={styles.infoCardContent}>
                    <Text style={[styles.infoCardTitle, getFontStyle('bold', 16, 'si')]}>{t('insect_details.additional_notes')}</Text>
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 0, top: 0 }}
                      onPress={() => speak(details.additionalNotes, 'additionalNotes', lang)}
                    >
                      <Feather name={speakingId === 'additionalNotes' ? "square" : "volume-2"} size={18} color="#059669" />
                    </TouchableOpacity>
                    <Text style={[styles.infoCardText, getFontStyle('regular', 14, 'si')]}>{details.additionalNotes}</Text>
                  </View>
                </View>
              )}
            </>
          )}

          {/* DAMAGE TAB */}
          {activeTab === 1 && (
            <>
              {/* Damage / Symptoms */}
              {details.damageSymptomsContent && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, getFontStyle('bold', 20, 'si')]}>{details.damageSymptomsTitle || t('insect_details.damage_symptoms')}</Text>
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
                        <MaterialCommunityIcons name="alert-decagram" size={24} color="white" />
                      </View>
                      <Text style={[styles.cardTitle, getFontStyle('bold', 18, 'si')]}>{t('insect_details.damage')}</Text>
                      <TouchableOpacity onPress={() => speak(details.damageSymptomsContent, 'damage', lang)}>
                        <Feather name={speakingId === 'damage' ? "square" : "volume-2"} size={20} color="#059669" />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.cardContent, getFontStyle('regular', 15, 'si')]}>{details.damageSymptomsContent}</Text>
                  </View>
                </View>
              )}
            </>
          )}

          {/* CONTROL TAB */}
          {activeTab === 2 && (
            <>
              {/* Control Methods - Expanded */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, getFontStyle('bold', 20, 'si')]}>{details.controlMethodsTitle || t('insect_details.control_methods')}</Text>
                  <TouchableOpacity
                    onPress={() => speak(details.controlMethodsContent, 'control', lang)}
                    style={{ marginLeft: 10, marginTop: -12 }}
                  >
                    <Feather name={speakingId === 'control' ? "square" : "volume-2"} size={20} color="#059669" />
                  </TouchableOpacity>
                </View>

                {details.controlMethodsContent && (
                  <Text style={[styles.introText, getFontStyle('regular', 15, 'si')]}>{details.controlMethodsContent}</Text>
                )}

                {/* Resistant Varieties */}
                {details.resistantVarieties && (
                  <View style={styles.infoCard}>
                    <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
                      <MaterialCommunityIcons name="sprout" size={24} color="white" />
                    </View>
                    <View style={styles.infoCardContent}>
                      <Text style={[styles.infoCardTitle, getFontStyle('bold', 16, 'si')]}>{t('insect_details.resistant_varieties')}</Text>
                      <Text style={[styles.infoCardText, getFontStyle('regular', 14, 'si')]}>{details.resistantVarieties}</Text>
                    </View>
                  </View>
                )}

                {/* Pesticide Instructions */}
                {details.pesticideInstructions && (
                  <View style={styles.infoCard}>
                    <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
                      <MaterialCommunityIcons name="bottle-tonic-skull" size={24} color="white" />
                    </View>
                    <View style={styles.infoCardContent}>
                      <Text style={[styles.infoCardTitle, getFontStyle('bold', 16, 'si')]}>{t('insect_details.pesticides')}</Text>
                      <Text style={[styles.infoCardText, getFontStyle('regular', 14, 'si')]}>{details.pesticideInstructions}</Text>
                    </View>
                  </View>
                )}

                {/* Eco Friendly */}
                {details.ecoFriendlySolutions && (
                  <View style={styles.infoCard}>
                    <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
                      <MaterialCommunityIcons name="ladybug" size={24} color="white" />
                    </View>
                    <View style={styles.infoCardContent}>
                      <Text style={[styles.infoCardTitle, getFontStyle('bold', 16, 'si')]}>{t('insect_details.eco_friendly')}</Text>
                      <Text style={[styles.infoCardText, getFontStyle('regular', 14, 'si')]}>{details.ecoFriendlySolutions}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Chemical Control Table */}
              {details.chemicalControlTable && details.chemicalControlTable.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, getFontStyle('bold', 20, 'si')]}>{t('insect_details.chemical_control')}</Text>
                  </View>

                  <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, getFontStyle('bold', 12, 'si'), { flex: 2, borderRightWidth: 1, borderRightColor: '#E5E7EB', paddingRight: 10 }]}>කෘමිනාශකයේ පොදු නාමය</Text>
                      <Text style={[styles.tableHeaderText, getFontStyle('bold', 12, 'si'), { flex: 1, borderRightWidth: 1, borderRightColor: '#E5E7EB', paddingLeft: 10, paddingRight: 10 }]}>සාන්ද්‍රණය</Text>
                      <Text style={[styles.tableHeaderText, getFontStyle('bold', 12, 'si'), { flex: 1.5, paddingLeft: 10 }]}>හෙක්ටයාරයකට යෙදිය යුතු ප්‍රමාණය</Text>
                    </View>
                    {details.chemicalControlTable.map((row: any, index: number) => (
                      <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
                        <Text style={[styles.tableCell, getFontStyle('bold', 12, 'si'), { flex: 2, borderRightWidth: 1, borderRightColor: '#E5E7EB', paddingRight: 10 }]}>{row.name}</Text>
                        <Text style={[styles.tableCell, getFontStyle('regular', 12, 'si'), { flex: 1, borderRightWidth: 1, borderRightColor: '#E5E7EB', paddingLeft: 10, paddingRight: 10 }]}>{row.concentration || '-'}</Text>
                        <Text style={[styles.tableCell, getFontStyle('regular', 12, 'si'), { flex: 1.5, paddingLeft: 10 }]}>{row.amount || '-'}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

        </View>
      </ScrollView>

      {/* Collection Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, getFontStyle('bold', 18, 'si')]}>{t('collection.select_collection')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {collections.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, getFontStyle('regular', 16, 'si')]}>{t('collection.no_collections')}</Text>
              </View>
            ) : (
              <FlatList
                data={collections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.collectionItem}
                    onPress={() => saveToCollection(item.id)}
                    disabled={saving}
                  >
                    <View style={styles.collectionIcon}>
                      <Feather name="folder" size={24} color="#3A8A55" />
                    </View>
                    <Text style={[styles.collectionName, getFontStyle('semiBold', 16, 'si')]}>{item.name}</Text>
                    {saving && <ActivityIndicator size="small" color="#3A8A55" />}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const Accordion = ({ title, content }: { title: string, content: string }) => {
  const [expanded, setExpanded] = useState(false);
  const { speak, stop, speakingId } = useTTS();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  // Generate a simple ID based on title (or pass a unique ID prop if available)
  const id = `accordion-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <View style={styles.accordionContainer}>
      <View style={styles.accordionHeader}>
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={styles.accordionIcon}>
            <Feather name="droplet" size={24} color="#3A8A55" />
          </View>
          <Text style={styles.accordionTitle}>{title}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => speak(content, id, lang)}>
          <Feather name={speakingId === id ? "square" : "volume-2"} size={24} color="#666" />
        </TouchableOpacity>
      </View>
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
  headerDetailsContainer: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  detailLabel: {
    color: '#333',
    fontWeight: '600',
  },
  detailValue: {
    color: '#555',
  },
  description: { ...Fonts.styles.regular, fontSize: 15, color: '#555', lineHeight: 24, marginBottom: 20 },
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
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
    ...Fonts.styles.bold,
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
  },
  cardContent: {
    ...Fonts.styles.regular,
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeaderUnderline: {
    height: 3,
    backgroundColor: '#059669',
    width: 40,
    borderRadius: 2,
    marginTop: 5,
    marginLeft: 10
  },
  introText: {
    ...Fonts.styles.regular,
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  infoCardContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoCardTitle: {
    ...Fonts.styles.bold,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  infoCardText: {
    ...Fonts.styles.regular,
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    ...Fonts.styles.bold,
    fontSize: 12,
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableRowEven: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    ...Fonts.styles.regular,
    fontSize: 12,
    color: '#4B5563',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  errorContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  errorTitle: {
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  errorMessage: {
    marginBottom: 25,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#3A8A55',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 15,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    ...Fonts.styles.bold,
    fontSize: 18,
    color: '#333',
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  collectionIcon: {
    marginRight: 15,
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 8,
  },
  collectionName: {
    ...Fonts.styles.semiBold,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    ...Fonts.styles.regular
  }
});
