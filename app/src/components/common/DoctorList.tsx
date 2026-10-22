import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem, Platform, StyleProp, ViewStyle, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation } from 'lucide-react-native';
import { Doctor } from '../../types';
import { SearchTown } from '../../services/api';
import { useApp } from '../../store/AppContext';
import { DoctorCard } from './DoctorCard';

type Row =
  | { type: 'label'; key: string; text: string; inside: boolean }
  | { type: 'notice'; key: string; text: string }
  | { type: 'doctor'; key: string; doctor: Doctor };

interface DoctorListProps {
  doctors: Doctor[];
  town: SearchTown | null;
  header?: React.ReactElement;
  footer?: React.ReactElement;
  empty?: React.ReactElement | null;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export const DoctorList: React.FC<DoctorListProps> = ({
  doctors,
  town,
  header,
  footer,
  empty,
  style,
  contentContainerStyle,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}) => {
  const { t } = useTranslation();
  const { theme } = useApp();

  const rows = useMemo<Row[]>(() => {
    if (!doctors.length) return [];
    const doctorRows = (list: Doctor[]): Row[] => list.map((doctor) => ({ type: 'doctor', key: doctor.id, doctor }));
    if (!town) {
      return [{ type: 'label', key: 'label-nearest', text: t('search.sortedNearest'), inside: false }, ...doctorRows(doctors)];
    }
    const inTown = doctors.filter((d) => d.inTown);
    const outside = doctors.filter((d) => !d.inTown);
    const result: Row[] = [];
    if (town.doctorCount === 0) result.push({ type: 'notice', key: 'notice', text: t('search.noneInTown', { town: town.name }) });
    if (inTown.length) {
      result.push({ type: 'label', key: 'label-in', text: t('search.inTown', { town: town.name }), inside: true }, ...doctorRows(inTown));
    }
    if (outside.length) {
      const text = town.doctorCount === 0 ? t('search.sortedNearest') : t('search.outsideTown', { town: town.name });
      result.push({ type: 'label', key: 'label-out', text, inside: false }, ...doctorRows(outside));
    }
    return result;
  }, [doctors, town, t]);

  const renderItem = useCallback<ListRenderItem<Row>>(
    ({ item }) => {
      if (item.type === 'doctor') {
        return (
          <View style={styles.row}>
            <DoctorCard doctor={item.doctor} />
          </View>
        );
      }
      if (item.type === 'notice') {
        return (
          <View style={[styles.row, styles.notice, { backgroundColor: theme.warningLight }]}>
            <Text style={[styles.noticeText, { color: theme.warningText }]}>{item.text}</Text>
          </View>
        );
      }
      return (
        <View style={[styles.row, styles.label]}>
          {item.inside ? <MapPin size={13} color={theme.primary} /> : <Navigation size={13} color={theme.textSecondary} />}
          <Text style={[styles.labelText, { color: item.inside ? theme.primaryDark : theme.textSecondary }]}>{item.text}</Text>
        </View>
      );
    },
    [theme]
  );

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => row.key}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListFooterComponent={
        <>
          {loadingMore && (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={theme.primary} />
            </View>
          )}
          {footer}
        </>
      }
      onEndReached={() => {
        if (hasMore && !loadingMore) onLoadMore?.();
      }}
      onEndReachedThreshold={0.6}
      ListEmptyComponent={empty}
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={5}
      maxToRenderPerBatch={6}
      windowSize={9}
      removeClippedSubviews={Platform.OS === 'android'}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notice: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
