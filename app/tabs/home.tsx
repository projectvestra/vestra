import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';

import GreetingSection from '../../src/components/home/GreetingSection';
import { getHomeSummary } from '../../src/services/homeService';

export default function Home() {
  const [summary, setSummary] = useState({
    totalItems: 0,
    recentItem: null,
  });

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    const data = await getHomeSummary();
    setSummary(data);
  };

  return (
    <ScrollView style={styles.container}>
      <GreetingSection
        name="Arnav"
        totalItems={summary.totalItems}
        recentItem={summary.recentItem}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
});
