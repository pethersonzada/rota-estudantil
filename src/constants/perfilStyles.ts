import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const perfilStyles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: colors.backgroundAlt 
    },
    scrollContent: { 
        padding: 20, 
        paddingBottom: 40 
    },
    header: { 
        alignItems: 'center', 
        marginBottom: 40,
        backgroundColor: colors.white,
        padding: 30,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border
    },
    avatar: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        backgroundColor: colors.primary, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 15 
    },
    avatarText: { 
        fontSize: 40, 
        color: colors.white, 
        fontWeight: 'bold' 
    },
    nome: { 
        fontSize: 24, 
        fontWeight: '800', 
        color: colors.textMain 
    },
    badge: { 
        flexDirection: 'row', 
        backgroundColor: colors.primary, 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 20, 
        marginTop: 10, 
        alignItems: 'center' 
    },
    badgeText: { 
        color: colors.white, 
        fontSize: 12, 
        fontWeight: '600', 
        marginLeft: 4 
    },
    card: { 
        backgroundColor: colors.white, 
        padding: 25, 
        borderRadius: 20, 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: colors.border 
    },
    infoRow: { 
        marginBottom: 10 
    },
    label: { 
        fontSize: 11, 
        color: colors.textMuted, 
        fontWeight: '800', 
        letterSpacing: 0.8 
    },
    valor: { 
        fontSize: 18, 
        color: colors.textMain, 
        fontWeight: '600', 
        marginTop: 4 
    },
    linha: { 
        height: 1, 
        backgroundColor: colors.backgroundAlt, 
        marginVertical: 15 
    },
    menuItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: colors.white, 
        padding: 20, 
        borderRadius: 15, 
        marginBottom: 15, 
        borderWidth: 1, 
        borderColor: colors.border 
    },
    menuText: { 
        flex: 1, 
        marginLeft: 15, 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#334155' 
    },
    botaoSair: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: colors.dangerBg, 
        padding: 18, 
        borderRadius: 15, 
        marginTop: 20, 
        borderWidth: 1, 
        borderColor: '#fecaca', 
        gap: 8 
    },
    textoBotaoSair: { 
        color: colors.danger, 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    botaoDeletar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: colors.danger, 
        padding: 18, 
        borderRadius: 15, 
        marginTop: 15, 
        borderWidth: 1, 
        borderColor: '#991b1b', 
        gap: 8 
    },
    textoBotaoDeletar: { 
        color: colors.white, 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    modalContent: { 
        backgroundColor: colors.white, 
        width: '100%', 
        borderRadius: 20, 
        padding: 25, 
        alignItems: 'center' 
    },
    iconeAlerta: { 
        width: 80, 
        height: 80, 
        borderRadius: 40, 
        backgroundColor: colors.dangerBg, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    modalTitulo: { 
        fontSize: 22, 
        fontWeight: '900', 
        color: colors.textMain, 
        marginBottom: 10 
    },
    modalTexto: { 
        fontSize: 14, 
        color: colors.textMuted, 
        textAlign: 'center', 
        marginBottom: 20, 
        lineHeight: 22 
    },
    inputCodigo: { 
        width: '100%', 
        backgroundColor: colors.backgroundAlt, 
        borderWidth: 1, 
        borderColor: '#cbd5e1', 
        borderRadius: 12, 
        padding: 15, 
        fontSize: 16, 
        textAlign: 'center', 
        fontWeight: 'bold', 
        color: colors.textMain, 
        marginBottom: 25 
    },
    modalBotoes: { 
        flexDirection: 'row', 
        gap: 15, 
        width: '100%' 
    },
    botaoModal: { 
        flex: 1, 
        paddingVertical: 16, 
        borderRadius: 12, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    botaoCancelar: { 
        backgroundColor: colors.backgroundAlt 
    },
    textoBotaoCancelar: { 
        color: colors.textMuted, 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    botaoConfirmarExclusao: { 
        backgroundColor: colors.danger 
    },
    textoBotaoConfirmarExclusao: { 
        color: colors.white, 
        fontSize: 16, 
        fontWeight: 'bold' 
    }
});