import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../../types/navigation';
import Tab from '../../components/common/Tab';
import { colors } from '../../constants/colors';
import { useOptionGroup } from '../../hooks/useOptionGroup';
import { TabType } from '../../types/heart';
import { TABS } from '../../constants/heartData';
import DrinkList from '../../components/domain/heart/DrinkList';
import BrandList from '../../components/domain/heart/BrandsList';
import BrandChips from '../../components/domain/heart/ButtonChips';

export default function HeartScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Heart'>>();
  const [activeTab, setActiveTab] = useState<TabType>('drink');
  const { chipSelected } = useOptionGroup('brand');

  return (
    <View style={styles.container}>
      <Tab
        tabs={TABS}
        value={activeTab}
        onChange={(k) => setActiveTab(k as TabType)}
      />

      {activeTab === 'drink' && <BrandChips />}

      <View style={styles.content}>
        {activeTab === 'drink' ? (
          <DrinkList selectedBrands={chipSelected} />
        ) : (
          <BrandList />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
  },
  content: {
    flex: 1,
  },
});