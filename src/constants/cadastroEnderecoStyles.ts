import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const cadastroEnderecoStyles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: colors.background 
    },
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
    },
    headerOverlay: { 
        position: 'absolute', 
        top: 0, 
        left: 20, 
        right: 20, 
        zIndex: 10, 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 15 
    },
    backButton: { 
        width: 45, 
        height: 45, 
        backgroundColor: colors.white, 
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3
    },
    headerText: { 
        fontSize: 20, 
        fontWeight: '800', 
        color: colors.textMain 
    },
    mapContainer: { 
        flex: 1 
    },
    footer: { 
        backgroundColor: colors.white, 
        paddingHorizontal: 25, 
        paddingTop: 25, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: -4 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 10, 
        elevation: 10 
    },
    enderecoLabel: { 
        fontWeight: '800', 
        color: colors.textMuted, 
        fontSize: 11, 
        letterSpacing: 0.8, 
        textTransform: 'uppercase' 
    },
    enderecoText: { 
        fontSize: 18, 
        marginVertical: 12, 
        color: colors.textMain, 
        fontWeight: '600' 
    },
    button: { 
        backgroundColor: colors.primary, 
        padding: 18, 
        borderRadius: 15, 
        alignItems: 'center', 
        marginTop: 10 
    },
    buttonText: { 
        color: colors.white, 
        fontSize: 16, 
        fontWeight: 'bold' 
    }
});