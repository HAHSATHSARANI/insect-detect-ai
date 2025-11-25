import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getFontStyle } from '@/constants/Fonts';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    buttons?: Array<{
        text: string;
        onPress?: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }>;
    icon?: 'check-circle' | 'alert-circle' | 'trash-2' | 'info';
    iconColor?: string;
    onClose?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    buttons = [{ text: 'OK', style: 'default' }],
    icon = 'check-circle',
    iconColor = '#3A8A55',
    onClose,
}) => {
    const handleButtonPress = (button: any) => {
        if (button.onPress) {
            button.onPress();
        }
        if (onClose) {
            onClose();
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Feather name={icon as any} size={52} color={iconColor} />
                    <Text style={[styles.title, getFontStyle('bold', 20, 'si')]}>{title}</Text>
                    <Text style={[styles.message, getFontStyle('regular', 16, 'si')]}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    button.style === 'cancel' && styles.cancelButton,
                                    button.style === 'destructive' && styles.destructiveButton,
                                    buttons.length === 1 && styles.singleButton,
                                ]}
                                onPress={() => handleButtonPress(button)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        getFontStyle('semiBold', 16, 'si'),
                                        button.style === 'cancel' && styles.cancelButtonText,
                                        button.style === 'destructive' && styles.destructiveButtonText,
                                    ]}
                                >
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    container: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        marginTop: 18,
        marginBottom: 10,
        textAlign: 'center',
        color: '#222',
    },
    message: {
        marginBottom: 24,
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
        paddingHorizontal: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    button: {
        flex: 1,
        backgroundColor: '#3A8A55',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    singleButton: {
        flex: 1,
    },
    cancelButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
    },
    destructiveButton: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        color: '#FFFFFF',
    },
    cancelButtonText: {
        color: '#666',
    },
    destructiveButtonText: {
        color: '#FFFFFF',
    },
});
