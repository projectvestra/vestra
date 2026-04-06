import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';

import { fetchFashionTrends } from '../../src/services/fashionService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';

export default function Explore() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchFashionTrends();
    setData(result);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const result = await fetchFashionTrends();
    setData(result);
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    let formattedDate = '';

    if (item.publishedAt) {
      try {
        formattedDate = new Date(item.publishedAt).toLocaleDateString();
      } catch (e) {
        formattedDate = '';
      }
    }

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}> 
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.bg2 }]} />
        )}

        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={[styles.description, { color: theme.text2 }]} numberOfLines={2}>
          {item.description}
        </Text>

        <Text style={[styles.meta, { color: theme.icon }] }>
          {item.source} - {formattedDate}
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={() => {
            if (item.url) {
              Linking.openURL(item.url);
            }
          }}
        >
          <Text style={styles.buttonText}>Read More</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }] }>
      <Text style={[styles.header, { color: theme.text }]}>Fashion Trends</Text>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {!loading && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  loader: {
    marginTop: 40,
    alignItems: 'center',
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#f4f4f4',
    borderRadius: 14,
    padding: 14,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  placeholder: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#777',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    marginTop: 6,
    fontSize: 14,
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});