import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Text,
  Card,
  Title,
  Avatar,
  Button,
  List,
  Divider,
  Surface,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState, AppDispatch } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { member } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getGenderText = (gender: string) => {
    return gender === 'male' ? 'ذكر' : 'أنثى';
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'غير محدد';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return `${age} سنة`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Surface style={styles.header}>
        <Avatar.Image
          size={100}
          source={{ uri: member?.profile_picture }}
          style={styles.avatar}
        />
        <Text style={styles.memberName}>{member?.full_name}</Text>
        <Text style={styles.memberNumber}>رقم العضوية: {member?.member_number}</Text>
        <Text style={styles.joinDate}>
          عضو منذ: {member?.join_date ? new Date(member.join_date).toLocaleDateString('ar-SA') : ''}
        </Text>
      </Surface>

      {/* Personal Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>المعلومات الشخصية</Title>
          
          <List.Item
            title="رقم الهاتف"
            description={member?.phone}
            left={() => <List.Icon icon="phone" />}
          />
          
          {member?.email && (
            <List.Item
              title="البريد الإلكتروني"
              description={member.email}
              left={() => <List.Icon icon="email" />}
            />
          )}
          
          <List.Item
            title="الجنس"
            description={getGenderText(member?.gender || '')}
            left={() => <List.Icon icon="person" />}
          />
          
          <List.Item
            title="العمر"
            description={calculateAge(member?.date_of_birth || '')}
            left={() => <List.Icon icon="cake" />}
          />
        </Card.Content>
      </Card>

      {/* Loyalty Points */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.loyaltyHeader}>
            <Icon name="stars" size={32} color="#FFD700" />
            <View style={styles.loyaltyInfo}>
              <Text style={styles.loyaltyPoints}>{member?.loyalty_points || 0}</Text>
              <Text style={styles.loyaltyLabel}>نقاط الولاء</Text>
            </View>
          </View>
          
          <Text style={styles.loyaltyDescription}>
            اكسب نقاط الولاء مع كل زيارة واستبدلها بخصومات وعروض خاصة!
          </Text>
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>الإعدادات</Title>
          
          <List.Item
            title="تعديل الملف الشخصي"
            left={() => <List.Icon icon="edit" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {}}
          />
          
          <Divider />
          
          <List.Item
            title="الإشعارات"
            left={() => <List.Icon icon="notifications" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {}}
          />
          
          <Divider />
          
          <List.Item
            title="اللغة"
            description="العربية"
            left={() => <List.Icon icon="language" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {}}
          />
          
          <Divider />
          
          <List.Item
            title="حول التطبيق"
            left={() => <List.Icon icon="info" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      {/* Support */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>الدعم والمساعدة</Title>
          
          <List.Item
            title="اتصل بالصالة"
            description="966-50-000-0000"
            left={() => <List.Icon icon="phone" />}
            onPress={() => {}}
          />
          
          <Divider />
          
          <List.Item
            title="واتساب"
            description="تواصل معنا عبر الواتساب"
            left={() => <List.Icon icon="message" />}
            onPress={() => {}}
          />
          
          <Divider />
          
          <List.Item
            title="الأسئلة الشائعة"
            left={() => <List.Icon icon="help" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      {/* Logout */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={handleLogout}
            icon="logout"
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
            textColor="#d32f2f"
          >
            تسجيل الخروج
          </Button>
        </Card.Content>
      </Card>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>الإصدار 1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 البسنديلي جيم</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    margin: 16,
    borderRadius: 15,
    elevation: 4,
  },
  avatar: {
    backgroundColor: '#1976d2',
    marginBottom: 16,
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  memberNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    margin: 16,
    borderRadius: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loyaltyInfo: {
    marginLeft: 16,
    flex: 1,
  },
  loyaltyPoints: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  loyaltyLabel: {
    fontSize: 16,
    color: '#666',
  },
  loyaltyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logoutButton: {
    borderColor: '#d32f2f',
    borderRadius: 10,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProfileScreen;
