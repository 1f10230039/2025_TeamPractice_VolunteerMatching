// 活動記録の詳細ページコンポーネント

"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import {
  FaPen,
  FaCalendarAlt,
  FaBullseye,
  FaPencilAlt,
  FaBuilding,
  FaUsers,
  FaLightbulb,
  FaCommentDots,
} from "react-icons/fa";
import Breadcrumbs from "../common/Breadcrumbs";

// ページ全体のコンテナ
const PageContainer = styled.div`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  @media (max-width: 600px) {
    margin-bottom: 150px;
  }
`;

// ページ上部（タイトルと編集ボタン）
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 16px;
`;

// 活動名
const LogTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  padding-right: 16px;
`;

// 編集ボタン
const EditButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: #0056b3;
  }

  & > svg {
    width: 0.9em;
    height: 0.9em;
  }
`;

// 詳細を表示する各セクション
const DetailSection = styled.section`
  margin-bottom: 24px;
`;

// セクションのタイトル (「参加した理由」とか)
const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  & > svg {
    width: 1.1rem;
    height: 1.1rem;
    color: #555;
  }
`;

// セクションの中身 (感想のテキストとか)
const SectionContent = styled.div`
  font-size: 1rem;
  color: #555;
  line-height: 1.7;
  white-space: pre-wrap;
  background-color: #fdfdfd;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
`;

// 日付や規模を表示する用のセクション
const SimpleInfo = styled.p`
  font-size: 1rem;
  color: #555;
  line-height: 1.7;
  font-weight: 500;
`;

// 日付を「YYYY年MM月DD日」にフォーマットする関数
const formatDate = dateString => {
  if (!dateString) return "日付未定";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return "日付形式エラー";
  }
};

export default function ActivityLogDetailPage({ log }) {
  // サーバーから渡された log データを展開
  const {
    id,
    name,
    datetime,
    reason,
    activity_scale,
    numbers,
    content,
    learning,
    reflection,
  } = log;

  // パンくずリスト用データ
  const crumbs = [
    { label: "活動の記録", href: "/activity-log" },
    { label: name || "活動詳細", href: `/activity-log/${id}` },
  ];
  const baseCrumb = { label: "マイページ", href: "/mypage" };

  return (
    <>
      <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />
      <PageContainer>
        <PageHeader>
          <LogTitle>{name || "無題の活動"}</LogTitle>
          <EditButton href={`/activity-log/${id}/edit`}>
            <FaPen />
            編集する
          </EditButton>
        </PageHeader>

        {/* 活動日 */}
        <DetailSection>
          <SectionTitle>
            <FaCalendarAlt />
            活動日
          </SectionTitle>
          <SimpleInfo>{formatDate(datetime)}</SimpleInfo>
        </DetailSection>

        {/* 参加した理由・目的 */}
        <DetailSection>
          <SectionTitle>
            <FaBullseye />
            参加した理由・目的
          </SectionTitle>
          <SectionContent>{reason || "記載なし"}</SectionContent>
        </DetailSection>

        {/* 活動内容 */}
        <DetailSection>
          <SectionTitle>
            <FaPencilAlt />
            活動内容
          </SectionTitle>
          <SectionContent>{content || "記載なし"}</SectionContent>
        </DetailSection>

        {/* 活動の規模 */}
        <DetailSection>
          <SectionTitle>
            <FaBuilding />
            活動の規模
          </SectionTitle>
          <SectionContent>{activity_scale || "記載なし"}</SectionContent>
        </DetailSection>

        {/* 参加人数 */}
        <DetailSection>
          <SectionTitle>
            <FaUsers />
            参加人数
          </SectionTitle>
          <SectionContent>{numbers || "記載なし"}</SectionContent>
        </DetailSection>

        {/* 活動による学び */}
        <DetailSection>
          <SectionTitle>
            <FaLightbulb />
            活動による学び
          </SectionTitle>
          <SectionContent>{learning || "記載なし"}</SectionContent>
        </DetailSection>

        {/* 活動の感想・反省 */}
        <DetailSection>
          <SectionTitle>
            <FaCommentDots />
            活動の感想・反省
          </SectionTitle>
          <SectionContent>{reflection || "記載なし"}</SectionContent>
        </DetailSection>
      </PageContainer>
    </>
  );
}
