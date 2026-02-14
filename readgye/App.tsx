import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

// 본인 PC의 로컬 IP (ipconfig로 확인한 값)
const API_URL = "http://192.168.219.101:8000";

// 타입 정의
interface ClauseAnalysis {
  clause_number: string;
  title: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  suggestion: string;
}

interface AnalysisResponse {
  filename: string;
  total_clauses: number;
  high_risk_count: number;
  clauses: ClauseAnalysis[];
}

// 위험도별 색상
const riskColors = {
  HIGH: { bg: "#FEE2E2", text: "#DC2626", label: "위험" },
  MEDIUM: { bg: "#FEF3C7", text: "#D97706", label: "주의" },
  LOW: { bg: "#D1FAE5", text: "#059669", label: "안전" },
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  // PDF 선택 + 서버 전송
  const pickAndAnalyze = async () => {
    try {
      // 1. PDF 파일 선택
      const docResult = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (docResult.canceled) return;

      const file = docResult.assets[0];
      setLoading(true);
      setResult(null);

      // 2. FormData로 FastAPI에 전송
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: "application/pdf",
      } as any);

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (error: any) {
      Alert.alert("오류", error.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logo}>읽계</Text>
        <Text style={styles.subtitle}>계약서 읽어주는 AI</Text>
      </View>

      {/* 업로드 버튼 */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickAndAnalyze}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.uploadIcon}>📄</Text>
            <Text style={styles.uploadText}>계약서 PDF 업로드</Text>
          </>
        )}
      </TouchableOpacity>

      {/* 분석 결과 */}
      {result && (
        <View style={styles.resultContainer}>
          {/* 요약 카드 */}
          <View style={styles.summaryCard}>
            <Text style={styles.filename}>{result.filename}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{result.total_clauses}</Text>
                <Text style={styles.summaryLabel}>총 조항</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: "#DC2626" }]}>
                  {result.high_risk_count}
                </Text>
                <Text style={styles.summaryLabel}>위험 조항</Text>
              </View>
            </View>
          </View>

          {/* 조항별 분석 */}
          {result.clauses.map((clause, index) => {
            const risk = riskColors[clause.risk_level];
            return (
              <View key={index} style={styles.clauseCard}>
                {/* 조항 헤더 */}
                <View style={styles.clauseHeader}>
                  <Text style={styles.clauseNumber}>
                    {clause.clause_number} {clause.title}
                  </Text>
                  <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                    <Text style={[styles.riskText, { color: risk.text }]}>
                      {risk.label}
                    </Text>
                  </View>
                </View>

                {/* 분석 내용 */}
                <Text style={styles.clauseSummary}>{clause.summary}</Text>

                {/* 수정 제안 */}
                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionLabel}>💡 수정 제안</Text>
                  <Text style={styles.suggestionText}>{clause.suggestion}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: "#1E293B",
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: "#2563EB",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  uploadIcon: {
    fontSize: 20,
  },
  uploadText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    padding: 20,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filename: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 20,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  clauseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  clauseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clauseNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  riskText: {
    fontSize: 12,
    fontWeight: "600",
  },
  clauseSummary: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 12,
  },
  suggestionBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: 12,
  },
  suggestionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0369A1",
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
});
