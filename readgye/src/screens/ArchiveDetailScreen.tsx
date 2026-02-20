import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { Colors, FontSize } from '../constants/theme';
import { API_BASE_URL, useAuth } from '../context/AuthContext';

type ArchiveStackParamList = {
  ArchiveMain: undefined;
  ArchiveDetail: { documentId: string; title: string };
};

type ClauseResult = {
  clause_number: string;
  title: string;
  original_text?: string;
  risk_level: 'HIGH' | 'MODERATE' | 'MEDIUM' | 'LOW' | string;
  summary: string;
  suggestion: string;
  legal_basis?: string;
};

type AnalysisResult = {
  filename: string;
  analysis: ClauseResult[];
};

export default function ArchiveDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ArchiveStackParamList, 'ArchiveDetail'>>();
  const route = useRoute<RouteProp<ArchiveStackParamList, 'ArchiveDetail'>>();
  const { token } = useAuth();

  const [clauses, setClauses] = useState<ClauseResult[]>([]);
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze/${route.params.documentId}/result`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || '상세 결과를 불러오지 못했습니다.');
      }

      const json = (await res.json()) as AnalysisResult;
      setFilename(json.filename || '');
      setClauses(json.analysis || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '상세 결과를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [route.params.documentId, token]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const isWarning = (level: string) => level === 'MODERATE' || level === 'MEDIUM';

  const isSummaryClause = (c: ClauseResult) =>
    c.clause_number === '종합 분석 결과' || c.clause_number === '부동산 종합 분석';

  const regularClauses = clauses.filter((c) => !isSummaryClause(c));
  const summaryClauses = clauses.filter((c) => isSummaryClause(c));
  const highCount = regularClauses.filter((c) => c.risk_level === 'HIGH').length;
  const moderateCount = regularClauses.filter((c) => isWarning(c.risk_level)).length;
  const lowCount = regularClauses.filter((c) => c.risk_level === 'LOW').length;

  const getRiskColor = (level: string) => {
    if (level === 'HIGH')
      return { bg: Colors.red50, border: Colors.red100, text: Colors.red600, icon: Colors.red500 };
    if (isWarning(level))
      return { bg: Colors.yellow50, border: Colors.yellow100, text: Colors.primaryDark, icon: Colors.accent };
    return { bg: Colors.green50, border: Colors.green100, text: Colors.green600, icon: Colors.green500 };
  };

  const getRiskLabel = (level: string) => {
    if (level === 'HIGH') return '위험';
    if (isWarning(level)) return '주의';
    return '안전';
  };

  const getRiskIcon = (level: string): keyof typeof MaterialIcons.glyphMap => {
    if (level === 'HIGH') return 'error';
    if (isWarning(level)) return 'warning';
    return 'check-circle';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.stone900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 결과</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={styles.loadingText}>분석 결과를 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingWrap}>
          <MaterialIcons name="error-outline" size={48} color={Colors.red500} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDetail}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 파일명 */}
          <View style={styles.filenameCard}>
            <MaterialIcons name="description" size={22} color={Colors.primaryDark} />
            <Text style={styles.filenameText} numberOfLines={1}>
              {filename || route.params.title}
            </Text>
          </View>

          {/* 요약 카드 */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: Colors.red50 }]}>
              <MaterialIcons name="error" size={20} color={Colors.red500} />
              <Text style={[styles.summaryCount, { color: Colors.red600 }]}>{highCount}</Text>
              <Text style={styles.summaryLabel}>위험</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: Colors.yellow50 }]}>
              <MaterialIcons name="warning" size={20} color={Colors.accent} />
              <Text style={[styles.summaryCount, { color: Colors.primaryDark }]}>{moderateCount}</Text>
              <Text style={styles.summaryLabel}>주의</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: Colors.green50 }]}>
              <MaterialIcons name="check-circle" size={20} color={Colors.green500} />
              <Text style={[styles.summaryCount, { color: Colors.green600 }]}>{lowCount}</Text>
              <Text style={styles.summaryLabel}>안전</Text>
            </View>
          </View>

          {/* 조항별 결과 */}
          <Text style={styles.sectionTitle}>조항별 분석 ({regularClauses.length}건)</Text>

          {regularClauses.map((clause, index) => {
            const color = getRiskColor(clause.risk_level);
            return (
              <View key={index} style={[styles.clauseCard, { borderLeftColor: color.icon, borderLeftWidth: 4 }]}>
                <View style={styles.clauseHeader}>
                  <View style={styles.clauseTitleRow}>
                    <MaterialIcons name={getRiskIcon(clause.risk_level)} size={18} color={color.icon} />
                    <Text style={styles.clauseNumber}>{clause.clause_number}</Text>
                    <Text style={styles.clauseTitle} numberOfLines={1}>{clause.title}</Text>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: color.bg }]}>
                    <Text style={[styles.riskBadgeText, { color: color.text }]}>{getRiskLabel(clause.risk_level)}</Text>
                  </View>
                </View>

                {clause.original_text ? (
                  <View style={[styles.clauseSection, styles.originalTextSection]}>
                    <Text style={styles.clauseSectionLabel}>계약서 원문</Text>
                    <Text style={styles.originalText}>{clause.original_text}</Text>
                  </View>
                ) : null}

                {clause.summary ? (
                  <View style={styles.clauseSection}>
                    <Text style={styles.clauseSectionLabel}>분석 요약</Text>
                    <Text style={styles.clauseSectionText}>{clause.summary}</Text>
                  </View>
                ) : null}

                {clause.legal_basis ? (
                  <View style={[styles.clauseSection, styles.legalBasisSection]}>
                    <MaterialIcons name="gavel" size={14} color={Colors.primaryDark} />
                    <Text style={styles.legalBasisText}>{clause.legal_basis}</Text>
                  </View>
                ) : null}

                {clause.suggestion ? (
                  <View style={[styles.clauseSection, styles.suggestionSection]}>
                    <Text style={styles.clauseSectionLabel}>수정 제안</Text>
                    <Text style={styles.clauseSectionText}>{clause.suggestion}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          {/* 종합 분석 결과 (별도 스타일) */}
          {summaryClauses.map((clause, index) => (
            <View key={`summary-${index}`} style={styles.summaryClauseCard}>
              <View style={styles.summaryClauseHeader}>
                <MaterialIcons name="assignment" size={20} color={Colors.stone600} />
                <Text style={styles.summaryClauseTitle}>{clause.clause_number}</Text>
              </View>
              <Text style={styles.summaryClauseSubtitle}>{clause.title}</Text>

              {clause.summary ? (
                <View style={styles.summaryClauseBody}>
                  <Text style={styles.summaryClauseText}>{clause.summary}</Text>
                </View>
              ) : null}

              {clause.suggestion ? (
                <View style={styles.summaryClauseSuggestion}>
                  <Text style={styles.clauseSectionLabel}>종합 의견</Text>
                  <Text style={styles.summaryClauseText}>{clause.suggestion}</Text>
                </View>
              ) : null}
            </View>
          ))}

          {clauses.length === 0 && (
            <View style={styles.emptyWrap}>
              <MaterialIcons name="search-off" size={48} color={Colors.stone300} />
              <Text style={styles.emptyText}>분석된 조항이 없습니다</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.stone900 },
  headerRight: { width: 40 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: FontSize.sm, color: Colors.stone500 },
  errorText: { fontSize: FontSize.md, color: Colors.red500, fontWeight: '600' },
  retryButton: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Colors.primaryDark, borderRadius: 10 },
  retryText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  filenameCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.stone100, marginBottom: 16,
  },
  filenameText: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.stone900 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, gap: 4 },
  summaryCount: { fontSize: FontSize['2xl'], fontWeight: '800' },
  summaryLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.stone500 },

  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.stone900, marginBottom: 14 },

  clauseCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.stone100,
  },
  clauseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  clauseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 },
  clauseNumber: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.stone900 },
  clauseTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.stone600, flex: 1 },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  riskBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },

  clauseSection: { marginBottom: 8 },
  originalTextSection: {
    backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12,
    borderLeftWidth: 3, borderLeftColor: Colors.stone100,
  },
  originalText: { fontSize: FontSize.xs, color: Colors.stone500, lineHeight: 18, fontStyle: 'italic' },
  legalBasisSection: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
  },
  legalBasisText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.primaryDark, flex: 1 },
  suggestionSection: { backgroundColor: Colors.stone50, borderRadius: 10, padding: 12, marginBottom: 0 },
  clauseSectionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.stone400, marginBottom: 4 },
  clauseSectionText: { fontSize: FontSize.sm, color: Colors.stone800, lineHeight: 20 },

  summaryClauseCard: {
    backgroundColor: Colors.stone50, borderRadius: 14, padding: 16,
    marginTop: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.stone200,
  },
  summaryClauseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  summaryClauseTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.stone700 },
  summaryClauseSubtitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.stone500, marginBottom: 12, marginLeft: 28 },
  summaryClauseBody: { backgroundColor: Colors.white, borderRadius: 10, padding: 12, marginBottom: 8 },
  summaryClauseSuggestion: { backgroundColor: Colors.white, borderRadius: 10, padding: 12 },
  summaryClauseText: { fontSize: FontSize.sm, color: Colors.stone600, lineHeight: 20 },

  emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: FontSize.md, color: Colors.stone400 },
});
