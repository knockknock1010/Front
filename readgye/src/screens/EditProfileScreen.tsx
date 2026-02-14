import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';
import { useAuth, BackendProfile } from '../context/AuthContext';

type Props = {
  navigation: any;
};

export default function EditProfileScreen({ navigation }: Props) {
  const { user, fetchBackendProfile } = useAuth();
  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBackendProfile();
      if (data) {
        setProfile(data);
      } else {
        // 백엔드 토큰이 없으면 로컬 사용자 정보 사용
        setError('백엔드 인증 정보가 없습니다. 로컬 정보를 표시합니다.');
      }
    } catch (e) {
      setError('프로필 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 표시할 이름/이메일 결정 (백엔드 우선, 없으면 로컬)
  const displayName = profile?.name ?? user?.name ?? '사용자';
  const displayEmail = profile?.email ?? user?.email ?? '';
  const displayId = profile?.id ?? user?.id ?? '';

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.stone900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 수정</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={styles.loadingText}>프로필 정보를 불러오는 중...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* 프로필 아바타 */}
          <View style={styles.avatarSection}>
            {user?.picture ? (
              <Image
                source={{ uri: user.picture }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={48} color={Colors.primaryDark} />
              </View>
            )}
          </View>

          {/* 알림 배너 */}
          {error && (
            <View style={styles.warningBanner}>
              <MaterialIcons name="info-outline" size={18} color={Colors.primaryDark} />
              <Text style={styles.warningText}>{error}</Text>
            </View>
          )}

          {profile && (
            <View style={styles.successBanner}>
              <MaterialIcons name="check-circle" size={18} color={Colors.green600} />
              <Text style={styles.successText}>백엔드에서 정보를 불러왔습니다</Text>
            </View>
          )}

          {/* 정보 카드 */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>기본 정보</Text>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>이름</Text>
              <Text style={styles.fieldValue}>{displayName}</Text>
            </View>
            <View style={styles.fieldDivider} />

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>이메일</Text>
              <Text style={styles.fieldValue}>{displayEmail}</Text>
            </View>
            <View style={styles.fieldDivider} />

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>사용자 ID</Text>
              <Text style={styles.fieldValueSmall} numberOfLines={1} ellipsizeMode="middle">
                {displayId}
              </Text>
            </View>
          </View>

          {/* 데이터 소스 표시 */}
          <View style={styles.sourceCard}>
            <MaterialIcons
              name={profile ? 'cloud-done' : 'phone-android'}
              size={20}
              color={profile ? Colors.green600 : Colors.stone500}
            />
            <Text style={styles.sourceText}>
              {profile ? '서버(백엔드)에서 가져온 정보' : '로컬 저장소 정보'}
            </Text>
          </View>

          {/* 새로고침 버튼 */}
          <TouchableOpacity
            style={styles.refreshButton}
            activeOpacity={0.8}
            onPress={loadProfile}
          >
            <MaterialIcons name="refresh" size={20} color={Colors.white} />
            <Text style={styles.refreshText}>프로필 다시 불러오기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.stone900,
  },
  headerRight: {
    width: 40,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.yellow100,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.yellow100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.yellow50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.yellow100,
  },
  warningText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.primaryDark,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.green50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.green100,
  },
  successText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.green600,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    fontWeight: '600',
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.stone500,
  },
  fieldValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.stone900,
  },
  fieldValueSmall: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.stone900,
    maxWidth: '60%',
  },
  fieldDivider: {
    height: 1,
    backgroundColor: Colors.stone100,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.stone100,
    marginBottom: 20,
  },
  sourceText: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
  },
  refreshText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
});
