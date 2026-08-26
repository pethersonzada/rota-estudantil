import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const homePassageiroStyles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: colors.backgroundAlt 
    },
    header: { 
        padding: 30, 
        backgroundColor: colors.white, 
        borderBottomLeftRadius: 30, 
        borderBottomRightRadius: 30 
    },
    welcome: { 
        fontSize: 28, 
        fontWeight: '800', 
        color: colors.textMain 
    },
    dateText: { 
        color: colors.textMuted, 
        fontSize: 12, 
        fontWeight: '600', 
        textTransform: 'uppercase', 
        marginBottom: 5 
    },
    scrollContent: { 
        padding: 20, 
        paddingBottom: 40 
    },
    bannerAlerta: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: colors.dangerBg, 
        padding: 15, 
        borderRadius: 15, 
        marginBottom: 20 
    },
    alertaTitulo: { 
        fontWeight: 'bold', 
        color: '#991b1b' 
    },
    alertaTexto: { 
        fontSize: 12, 
        color: '#b91c1c' 
    },
    topoPassageiro: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    sectionTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#334155' 
    },
    badge: { 
        backgroundColor: colors.border, 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 8 
    },
    badgeTexto: { 
        fontSize: 10, 
        fontWeight: 'bold', 
        color: colors.textMain 
    },
    radarCard: { 
        height: 200, 
        borderRadius: 20, 
        overflow: 'hidden', 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: colors.border, 
        backgroundColor: colors.white 
    },
    cadeadoBox: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    cadeadoTitulo: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#334155', 
        marginTop: 8 
    }
});