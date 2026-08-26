import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const cadastroStyles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: colors.background 
    },
    content: { 
        padding: 30, 
        flexGrow: 1, 
        justifyContent: 'center' 
    },
    titulo: { 
        fontSize: 28, 
        fontWeight: '800', 
        color: colors.textMain, 
        marginBottom: 10, 
        textAlign: 'center' 
    },
    subtitulo: { 
        fontSize: 16, 
        color: colors.textMuted, 
        marginBottom: 30, 
        textAlign: 'center', 
        lineHeight: 22 
    },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: colors.white, 
        borderRadius: 15, 
        marginBottom: 15, 
        borderWidth: 1, 
        borderColor: colors.border, 
        paddingHorizontal: 15,
        height: 58 
    },
    inputIcon: { 
        marginRight: 10 
    },
    inputComIcone: { 
        backgroundColor: 'transparent', 
        paddingVertical: 0, 
        paddingHorizontal: 0,
        fontSize: 16, 
        borderWidth: 0, 
        color: colors.textMain,
        flex: 1,
        height: '100%'
    },
    eyeIcon: { 
        padding: 10 
    },
    infoBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#eff6ff', 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: '#bfdbfe' 
    },
    infoText: { 
        flex: 1, 
        color: '#1e40af', 
        fontSize: 13, 
        marginLeft: 10, 
        fontWeight: '500' 
    },
    btnPrimary: { 
        backgroundColor: colors.primary, 
        padding: 20, 
        borderRadius: 15, 
        alignItems: 'center', 
        marginTop: 10 
    },
    btnText: { 
        color: colors.white, 
        fontSize: 16, 
        fontWeight: 'bold', 
        letterSpacing: 1 
    },
    backButton: { 
        width: 45, 
        height: 45, 
        backgroundColor: colors.white, 
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: colors.border 
    }
});