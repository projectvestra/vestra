import { ScrollView, StyleSheet } from 'react-native';
import { getExploreFeed } from '../../src/services/exploreService';
import ExploreFeedCard from '../../src/components/ExploreFeedCard';

export default function Explore() {
  const feed = getExploreFeed();

  return (
    <ScrollView style={styles.container}>
      {feed.map((item) => (
        <ExploreFeedCard key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
});
