import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState, AppDispatch } from '../../store/store';
import { login, clearError } from '../../store/slices/authSlice';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [phone, setPhone] = useState('');
  const [memberNumber, setMemberNumber] = useState('');

  const handleLogin = async () => {
    if (!phone.trim() || !memberNumber.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم الهاتف ورقم العضوية');
      return;
    }

    dispatch(clearError());
    const result = await dispatch(login({ phone: phone.trim(), member_number: memberNumber.trim() }));
    
    if (login.rejected.match(result)) {
      Alert.alert('خطأ في تسجيل الدخول', result.payload as string);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Surface style={styles.logoContainer}>
        <Icon name="fitness-center" size={80} color="#1976d2" />
        <Title style={styles.title}>البسنديلي جيم</Title>
        <Paragraph style={styles.subtitle}>تطبيق الأعضاء</Paragraph>
      </Surface>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>تسجيل الدخول</Title>
          
          <TextInput
            label="رقم الهاتف"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
            placeholder="05xxxxxxxx"
          />

          <TextInput
            label="رقم العضوية"
            value={memberNumber}
            onChangeText={setMemberNumber}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="card-account-details" />}
            placeholder="GYM2024xxxx"
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              'تسجيل الدخول'
            )}
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.infoTitle}>كيفية الحصول على بيانات الدخول؟</Title>
          <Paragraph style={styles.infoParagraph}>
            • رقم الهاتف: نفس الرقم المسجل في الصالة
          </Paragraph>
          <Paragraph style={styles.infoParagraph}>
            • رقم العضوية: يمكنك الحصول عليه من موظف الاستقبال
          </Paragraph>
          <Paragraph style={styles.infoParagraph}>
            • في حالة نسيان البيانات، يرجى التواصل مع الصالة
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 20,
    borderRadius: 15,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
    borderRadius: 15,
    elevation: 4,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 10,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  infoCard: {
    borderRadius: 15,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
  },
  infoParagraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
    textAlign: 'right',
  },
});

export default LoginScreen;
