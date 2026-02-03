import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, UIManager, LayoutAnimation } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../../constants/colors";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type Section = {
  id: string;
  title: string;
  body: string;
};

const TermsScreen: React.FC = () => {
  const sections: Section[] = useMemo(
    () => [
      {
        id: "1",
        title: "1. 개인정보 수집 항목 및 방법",
        body: `서비스는 회원가입 및 서비스 제공을 위해 아래의 개인정보를 수집합니다.
※ 서비스는 주민등록번호, 금융정보, 위치 정보, 건강 정보 등 민감한 개인정보를 수집하지 않습니다.

필수 항목
- 이메일 주소
- 비밀번호 (암호화하여 저장)
- 닉네임

선택 항목
- 프로필 이미지

서비스 이용 과정에서 생성되는 정보
- 카페 음료 기록 데이터
- 카페인 및 당류 섭취 기록
- 개인 기준 설정 정보

자동 수집 항목
- 서비스 이용 기록
- 기기 정보(운영체제, 앱 버전 등)
- 로그 데이터

(2) 개인정보 수집 방법
- 회원가입 및 서비스 이용 과정에서 이용자가 직접 입력
- 소셜 로그인 이용 시, 해당 소셜 플랫폼을 통해 제공받은 정보`,
      },
      {
        id: "2",
        title: "2. 개인정보의 이용 목적",
        body: `수집한 개인정보는 다음의 목적을 위해 이용됩니다.
- 회원 식별 및 로그인 관리
- 카페 음료 기록 및 개인 기준 설정 기능 제공
- 섭취 기록 조회 및 개인 통계 제공
- 서비스 이용 기록 관리 및 서비스 개선
- 비밀번호 재설정 안내`,
      },
      {
        id: "3",
        title: "3. 개인정보의 보유 및 이용 기간",
        body: `이용자가 회원 탈퇴를 요청한 경우, 개인정보 및 서비스 이용 기록은 지체 없이 삭제됩니다.
단, 관련 법령에 따라 일정 기간 보관이 필요한 경우에는 해당 법령에서 정한 기간 동안 보관할 수 있습니다.`,
      },
      {
        id: "4",
        title: "4. 개인정보의 삭제 및 회원 탈퇴",
        body: `이용자는 언제든지 앱 내 마이페이지 > 회원 탈퇴 기능을 통해 계정을 삭제할 수 있습니다.
회원 탈퇴 시 계정 정보, 음료 기록 및 기준 설정 정보, 기타 서비스 이용 데이터는 모두 삭제되며, 삭제된 정보는 복구할 수 없습니다.`,
      },
      {
        id: "5",
        title: "5. 개인정보의 제3자 제공",
        body: `서비스는 이용자의 개인정보를 외부에 제공하지 않습니다.
다만, 법령에 따라 제공이 요구되는 경우는 예외로 합니다.`,
      },
      {
        id: "6",
        title: "6. 개인정보의 처리 위탁",
        body: `서비스는 원활한 서비스 제공을 위해 아래와 같은 업무를 위탁할 수 있습니다.
위탁 시 관련 법령에 따라 개인정보가 안전하게 관리되도록 필요한 조치를 취합니다.

- 클라우드 서버 및 데이터베이스 운영
- 이메일 발송 서비스(비밀번호 재설정 안내 등)`,
      },
      {
        id: "7",
        title: "7. 개인정보의 안전성 확보 조치",
        body: `서비스는 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다.
- 비밀번호 암호화 저장
- 접근 권한 최소화
- 개인정보 처리 시스템의 보안 관리`,
      },
      {
        id: "8",
        title: "8. 건강/의료 정보 관련 안내",
        body: `본 서비스는 의료 목적의 서비스가 아니며,
질병의 진단, 치료 또는 예방을 위한 의료·건강 정보를 제공하지 않습니다.
서비스에서 제공하는 카페인 및 당류 정보는 개인 기록 및 참고용으로만 제공됩니다.`,
      },
      {
        id: "9",
        title: "9. 브랜드 및 제휴 관계 안내",
        body: `본 서비스는 특정 카페 브랜드와 제휴 관계가 없으며,
앱 내에 표시되는 브랜드명 및 메뉴명은 사용자 이해를 돕기 위한 정보 제공 목적으로만 사용됩니다.`,
      },
      {
        id: "10",
        title: "10. 개인정보 보호책임자",
        body: `개인정보 보호와 관련한 문의는 아래로 연락하실 수 있습니다.
- 개인정보 보호책임자: 라스트컵
- 문의 이메일: 2seo02seo0@naver.com`,
      },
      {
        id: "11",
        title: "11. 개인정보처리방침의 변경",
        body: `본 개인정보처리방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며,
변경 시 앱 내 공지사항을 통해 안내합니다.`,
      },
    ],
    []
  );

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.bigTitle}>개인정보처리방침</Text>
        <Text style={styles.mainAccount}>
            라스트컵(이하 “서비스”)은 「개인정보 보호법」 등 관련 법령을 준수하며,
이용자의 개인정보를 보호하기 위해
다음과 같은 개인정보처리방침을 수립·공개합니다.{"\n"}
본 방침은 App Store Connect 메타데이터 및 앱 내에서
언제든지 확인할 수 있습니다.
        </Text>

        <View style={styles.list}>
          {sections.map((s) => {
            const opened = openIds.has(s.id);

            return (
              <View key={s.id} style={styles.item}>
                <Pressable style={styles.itemHeader} onPress={() => toggle(s.id)} hitSlop={8}>
                  <Text style={styles.itemTitle}>{s.title}</Text>
                  <Text style={styles.chev}>{opened ? "⌃" : "⌄"}</Text>
                </Pressable>

                {opened && (
                  <View style={styles.bodyWrap}>
                    <Text style={styles.bodyText}>{s.body}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.footerNote}>※ 본 개인정보처리방침은 2026년 1월 22일부터 적용됩니다.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    paddingTop: -50
  },

  content: {
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  bigTitle: {
    color: colors.grayscale[300],
    fontSize: 24,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 8,
  },

  list: {
    borderTopWidth: 1,
    borderTopColor: colors.grayscale[900],
    alignSelf: 'stretch',
  },

  item: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grayscale[900],
    paddingLeft: 10,
  },

  itemHeader: {
    width: '100%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    paddingVertical: 18,
    paddingLeft: 0,
  },

  itemTitle: {
    color: colors.grayscale[300],
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    flex: 1,
    paddingRight: 12,
    paddingLeft: 0,
  },

  chev: {
    color: colors.grayscale[500],
    fontSize: 20,
    width: 24,
    textAlign: "right",
  },

  bodyWrap: {
    marginTop: 0,
    marginBottom: 20,
    paddingRight: 8,
  },

  bodyText: {
    color: colors.grayscale[500],
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Pretendard-Regular",
  },

  footerNote: {
    marginTop: 28,
    marginBottom: 50,
    color: colors.primary[700],
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
  },

  mainAccount: {
    marginTop: 8,
    marginBottom: 28,
    fontSize: 14,
    color: colors.grayscale[400],
    fontFamily: 'Pretendard-Regular',
    lineHeight: 20,
  },
});

export default TermsScreen;
