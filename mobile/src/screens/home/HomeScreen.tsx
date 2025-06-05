import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Avatar,
  Chip,
  Surface,
  Button,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState, AppDispatch } from '../../store/store';
import { getCurrentSubscription } from '../../store/slices/subscriptionSlice';

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { member } = useSelector((state: RootState) => state.auth);
  const { currentSubscription, isLoading } = useSelector((state: RootState) => state.subscription);

  useEffect(() => {
    dispatch(getCurrentSubscription());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(getCurrentSubscription());
  };

  const getSubscriptionStatus = (subscription: any) => {
    if (!subscription) return { label: 'غير مشترك', color: 'red' };
    
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (subscription.status === 'active') {
      if (daysLeft <= 3) {
        return { label: `ينتهي خلال ${daysLeft} أيام`, color: 'orange' };
      }
      return { label: 'نشط', color: 'green' };
    }
    
    return { label: 'منتهي', color: 'red' };
  };

  const subscriptionStatus = getSubscriptionStatus(currentSubscription);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>مرحباً</Text>
            <Text style={styles.memberName}>{member?.full_name}</Text>
            <Text style={styles.memberNumber}>رقم العضوية: {member?.member_number}</Text>
          </View>
          <Avatar.Image
            size={60}
            source={{ uri: member?.profile_picture }}
            style={styles.avatar}
          />
        </View>
      </Surface>

      {/* Subscription Status */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Icon name="card-membership" size={24} color="#1976d2" />
            <Title style={styles.cardTitle}>حالة الاشتراك</Title>
          </View>
          
          {currentSubscription ? (
            <View>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionType}>
                  {currentSubscription.subscription_type?.name}
                </Text>
                <Chip 
                  mode="flat" 
                  style={[styles.statusChip, { backgroundColor: subscriptionStatus.color + '20' }]}
                  textStyle={{ color: subscriptionStatus.color }}
                >
                  {subscriptionStatus.label}
                </Chip>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.dateInfo}>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>تاريخ البداية</Text>
                  <Text style={styles.dateValue}>
                    {new Date(currentSubscription.start_date).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>تاريخ الانتهاء</Text>
                  <Text style={styles.dateValue}>
                    {new Date(currentSubscription.end_date).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noSubscription}>
              <Icon name="info" size={48} color="#ccc" />
              <Text style={styles.noSubscriptionText}>لا يوجد اشتراك نشط</Text>
              <Button mode="contained" style={styles.renewButton}>
                تجديد الاشتراك
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="stars" size={32} color="#FFD700" />
            <Text style={styles.statNumber}>{member?.loyalty_points || 0}</Text>
            <Text style={styles.statLabel}>نقاط الولاء</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="calendar-today" size={32} color="#4CAF50" />
            <Text style={styles.statNumber}>
              {member?.join_date ? 
                Math.floor((new Date().getTime() - new Date(member.join_date).getTime()) / (1000 * 3600 * 24)) 
                : 0
              }
            </Text>
            <Text style={styles.statLabel}>يوم عضوية</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>الإجراءات السريعة</Title>
          
          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              icon="payment"
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              عرض المدفوعات
            </Button>
            
            <Button
              mode="outlined"
              icon="message"
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              الرسائل
            </Button>
            
            <Button
              mode="outlined"
              icon="person"
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              الملف الشخصي
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Gym Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>معلومات الصالة</Title>
          
          <View style={styles.gymInfo}>
            <View style={styles.gymInfoItem}>
              <Icon name="access-time" size={20} color="#666" />
              <Text style={styles.gymInfoText}>ساعات العمل: 6 ص - 12 م</Text>
            </View>
            
            <View style={styles.gymInfoItem}>
              <Icon name="phone" size={20} color="#666" />
              <Text style={styles.gymInfoText}>الهاتف: 966-50-000-0000</Text>
            </View>
            
            <View style={styles.gymInfoItem}>
              <Icon name="location-on" size={20} color="#666" />
              <Text style={styles.gymInfoText}>العنوان: الرياض، المملكة العربية السعودية</Text>
            </View>
          </View>
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
  header: {
    margin: 16,
    borderRadius: 15,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  memberName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    marginVertical: 4,
  },
  memberNumber: {
    fontSize: 14,
    color: '#666',
  },
  avatar: {
    backgroundColor: '#1976d2',
  },
  card: {
    margin: 16,
    borderRadius: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscriptionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionType: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    borderRadius: 20,
  },
  divider: {
    marginVertical: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noSubscription: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noSubscriptionText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 16,
  },
  renewButton: {
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 15,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 10,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  gymInfo: {
    gap: 12,
  },
  gymInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gymInfoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default HomeScreen;
