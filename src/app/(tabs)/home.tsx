import React from 'react';
import HomeMotorista from '../home-motorista';
import HomePassageiro from '../home-passageiro';
import { useAuth } from './../context/AuthContext';

export default function HomeTab() {
    const { user } = useAuth();

    return user.tipo === 'MOTORISTA' ? <HomeMotorista /> : <HomePassageiro />;
}