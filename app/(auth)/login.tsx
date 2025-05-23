import { auth } from '@/firebaseConfig';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleLogin = async () => {
        try {
            const user = await signInWithEmailAndPassword(auth, email, password);
            if (user) {
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            console.error(error);
            let errorMessage = 'Erro ao fazer login';
            if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
                errorMessage = 'Email ou senha incorretos.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Email ou senha incorretos.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
            }
            Alert.alert('Erro', errorMessage);
        }
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }
        try {
            const user = await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login agora.');
            setIsLogin(true);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error(error);
            let errorMessage = 'Erro ao criar conta';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este email já está em uso.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Endereço de e-mail inválido.';
            }
            Alert.alert('Erro', errorMessage);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isLogin ? 'Login' : 'Criar Conta'}</Text>
            <TextInput
                style={styles.input}
                placeholder={isLogin ? "Email ou Usuário" : "Email"}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {!isLogin && (
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar Senha"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            )}

            {isLogin ? (
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.buttonText}>ENTRAR</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={[styles.loginButton, styles.registerButton]} onPress={handleRegister}>
                    <Text style={styles.buttonText}>REGISTRAR</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchTextContainer}>
                <Text style={styles.switchText}>
                    {isLogin ? "Não tem uma conta? Crie uma" : "Já tem uma conta? Faça Login"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    input: {
        width: '100%',
        marginVertical: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    loginButton: {
        width: '100%',
        padding: 15,
        backgroundColor: '#007AFF',
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
    },
    registerButton: {
        backgroundColor: '#34C659',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchTextContainer: {
        marginTop: 20,
    },
    switchText: {
        color: '#007AFF',
        fontSize: 16,
        textDecorationLine: 'underline',
    }
}); 