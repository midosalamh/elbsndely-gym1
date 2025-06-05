import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Paragraph } from 'react-native-paper';

const SubscriptionScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>تفاصيل الاشتراك</Title>
          <Paragraph>هذه الشاشة قيد التطوير وستعرض تفاصيل اشتراك العضو</Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    borderRadius: 15,
    elevation: 2,
  },
});

export default SubscriptionScreen;
