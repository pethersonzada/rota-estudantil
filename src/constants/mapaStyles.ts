import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const mapaStyles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: colors.background 
    },
    map: { 
        flex: 1 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
    },
    loadingText: { 
        color: colors.textMuted, 
        fontSize: 16, 
        marginTop: 15, 
        fontWeight: '600' 
    },
    headerOverlay: { 
        position: 'absolute', 
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
    badgeSentido: { 
        flex: 1, 
        backgroundColor: colors.primary, 
        paddingVertical: 12, 
        borderRadius: 25, 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3
    },
    textoBadge: { 
        color: colors.white, 
        fontWeight: '800', 
        fontSize: 14, 
        letterSpacing: 1 
    },
    footerAcoes: { 
        position: 'absolute', 
        left: 20, 
        right: 20, 
        zIndex: 10 
    },
    btnIniciar: { 
        flexDirection: 'row', 
        backgroundColor: colors.success, 
        padding: 20, 
        borderRadius: 15, 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderWidth: 1, 
        borderColor: '#059669',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4
    },
    btnEncerrar: { 
        flexDirection: 'row', 
        backgroundColor: colors.danger, 
        padding: 20, 
        borderRadius: 15, 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderWidth: 1, 
        borderColor: '#dc2626',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4
    },
    btnText: { 
        color: colors.white, 
        fontSize: 16, 
        fontWeight: 'bold', 
        letterSpacing: 1 
    },
    btnCentralizar: { 
        position: 'absolute', 
        bottom: 130, 
        right: 20, 
        backgroundColor: colors.primary, 
        width: 50, 
        height: 50, 
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 3, 
        elevation: 5, 
        zIndex: 20 
    }
});