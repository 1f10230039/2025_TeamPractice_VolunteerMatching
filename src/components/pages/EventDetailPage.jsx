"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import Image from "next/image";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaYenSign,
  FaUsers,
  FaBuilding,
  FaLink,
  FaInfoCircle,
  FaRoute,
  FaSuitcase,
  FaTshirt,
  FaCheckCircle,
  FaRegCheckCircle,
  FaHeart,
  FaRegHeart,
  FaLightbulb,
  FaThumbsUp,
  FaComments,
  FaChalkboardTeacher,
} from "react-icons/fa";
import Breadcrumbs from "../common/Breadcrumbs";
import ConfirmApplyModal from "../events/ConfirmApplyModal";

// --- Emotion Styles ---

const PageWrapper = styled.div`
  padding-bottom: 80px; /* 下部固定バーの分だけ余白を確保 */
`;

const ActionMenu = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  z-index: 50;
`;

const FavoriteButton = styled.button`
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  width: 56px;
  height: 56px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  & > svg {
    width: 24px;
    height: 24px;
    color: ${props => (props.isFavorite ? "#e74c3c" : "#555")};
    transition: color 0.2s ease;
  }
`;

const ApplyButton = styled.button`
  flex-grow: 1;
  padding: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;

  background-color: ${props => (props.isApplied ? "#5cb85c" : "#007bff")};
  color: white;

  &:hover:not(:disabled) {
    background-color: ${props => (props.isApplied ? "#4cae4c" : "#0056b3")};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const MainContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: #e0eafc;
  color: #0056b3;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 12px;
`;

const EventTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Organizer = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MainImage = styled(Image)`
  width: 100%;
  height: auto; /* アスペクト比を維持するために必須 */
  max-height: 400px;
  border-radius: 12px;
  object-fit: cover;
  background-color: #f0f0f0;
  margin-bottom: 24px;
`;

const DetailSection = styled.section`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  & svg {
    color: #007bff;
    font-size: 1.1rem;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  padding: 20px;
  background-color: #fcfcfc;
`;

const InfoLabel = styled.dt`
  font-weight: bold;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;

  & > svg {
    width: 1rem;
    height: 1rem;
    color: #888;
    flex-shrink: 0;
  }
`;

const InfoValue = styled.dd`
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  margin: 0;
`;

const SectionContent = styled.div`
  font-size: 1rem;
  color: #555;
  line-height: 1.7;
  white-space: pre-wrap;
`;

// ポップなカード（魅力紹介用）
const PopCard = styled.div`
  background-color: ${props => props.bgColor || "#f9f9f9"};
  border: 2px solid ${props => props.borderColor || "transparent"};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const IconCircle = styled.div`
  background-color: #fff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  & svg {
    width: 28px;
    height: 28px;
    color: ${props => props.iconColor || "#333"};
  }
`;

const PopCardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: bold;
  color: ${props => props.textColor || "#333"};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PopCardText = styled.div`
  font-size: 1.2rem;
  line-height: 1.7;
  color: #444;
  white-space: pre-wrap;
`;

// 吹き出しスタイル（経験・スキル用）
const BubbleWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
`;

const BubbleContent = styled.div`
  position: relative;
  background-color: #e3f2fd;
  color: #333;
  padding: 24px;
  border-radius: 12px;
  flex: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &::before {
    content: "";
    position: absolute;
    top: 20px;
    left: -12px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 12px 8px 0;
    border-color: transparent #e3f2fd transparent transparent;
  }
`;

const SpeakerIcon = styled.div`
  width: 50px;
  height: 50px;
  background-color: #0277bd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 5px;

  & svg {
    color: #fff;
    width: 24px;
    height: 24px;
  }
`;

const BubbleTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: bold;
  color: #01579b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const WebsiteLink = styled(Link)`
  color: #007bff;
  text-decoration: underline;
  word-break: break-all;
  transition: color 0.2s ease;

  &:hover {
    color: #0056b3;
  }
`;

const formatDateTime = isoString => {
  if (!isoString) return "未定";
  try {
    const date = new Date(isoString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "日付形式エラー";
  }
};

// --- コンポーネント本体 ---

export default function EventDetailPage({ event, source, q, codes }) {
  const router = useRouter();

  // ローディング状態
  const [isApplyLoading, setIsApplyLoading] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // ユーザーごとのステータス管理
  const [isFavorite, setIsFavorite] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [user, setUser] = useState(null);

  // 応募確認モーダルの状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    body: "",
    confirmText: "",
    isDestructive: false,
  });

  /**
   * 画面表示時に実行:
   * ログインユーザー情報を取得し、「お気に入り済み」「応募済み」かどうかを
   * それぞれのテーブル (favorites, applications) に問い合わせて確認する。
   */
  useEffect(() => {
    const checkStatus = async () => {
      // 1. ログインユーザー取得
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // 未ログインまたはイベント情報がなければ終了
      if (!currentUser || !event) return;

      // 2. お気に入り状態の確認 (favoritesテーブル)
      const { data: favData } = await supabase
        .from("favorites")
        .select("id")
        .match({ user_id: currentUser.id, event_id: event.id })
        .maybeSingle(); // 0件か1件かを確認

      setIsFavorite(!!favData); // データがあれば true

      // 3. 応募状態の確認 (applicationsテーブル)
      const { data: appData } = await supabase
        .from("applications")
        .select("id")
        .match({ user_id: currentUser.id, event_id: event.id })
        .maybeSingle();

      setIsApplied(!!appData);
    };

    checkStatus();
  }, [event]);

  if (!event) {
    return <div>イベント情報を読み込み中...</div>;
  }

  // イベント情報の展開 (props から)
  const {
    id,
    name,
    tag,
    image_url,
    start_datetime,
    end_datetime,
    place,
    access,
    fee,
    capacity,
    organaizer,
    long_description,
    website_url,
    belongings,
    clothing,
    selection_flow,
    experience,
    appeal,
    review,
  } = event;

  // パンくずリストの生成ロジック
  const { baseCrumb, crumbs } = (() => {
    let base = { label: "ホーム", href: "/" };
    const thisPageCrumb = {
      label: name || "イベント詳細",
      href: `/events/${id}`,
    };
    let crumbList = [];
    switch (source) {
      case "mylist":
        base = { label: "マイリスト", href: "/mylist" };
        crumbList = [thisPageCrumb];
        break;
      case "keyword":
        crumbList = [
          { label: "キーワードから探す", href: "/search/keyword" },
          { label: "検索結果", href: `/search/keyword-results?q=${q || ""}` },
          thisPageCrumb,
        ];
        break;
      case "location":
        crumbList = [
          { label: "場所から探す", href: "/search/location" },
          {
            label: "検索結果",
            href: `/search/location-results?codes=${codes || ""}`,
          },
          thisPageCrumb,
        ];
        break;
      default:
        crumbList = [thisPageCrumb];
        break;
    }
    return { baseCrumb: base, crumbs: crumbList };
  })();

  const placeholderImage =
    "https://placehold.co/800x400/e0e0e0/777?text=No+Image";

  /**
   * お気に入りボタンの処理
   * favorites テーブルに対して INSERT (登録) または DELETE (解除) を行う
   */
  const handleToggleFavorite = async e => {
    e.preventDefault();
    if (isFavoriteLoading) return;

    if (!user) {
      alert("お気に入り機能を使うにはログインが必要です。");
      return;
    }

    setIsFavoriteLoading(true);

    try {
      if (isFavorite) {
        // 登録解除 (DELETE)
        const { error } = await supabase
          .from("favorites")
          .delete()
          .match({ user_id: user.id, event_id: id });
        if (error) throw error;
        setIsFavorite(false);
      } else {
        // 新規登録 (INSERT)
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, event_id: id });
        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("お気に入り更新エラー:", error.message);
      alert("処理に失敗しました。");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  /**
   * 応募処理の実行
   * applications テーブルに対して INSERT (応募) または DELETE (キャンセル) を行う
   */
  const handleToggleApply = async () => {
    if (isApplyLoading) return;

    if (!user) {
      alert("応募するにはログインが必要です。");
      setIsModalOpen(false);
      return;
    }

    setIsApplyLoading(true);

    try {
      if (isApplied) {
        // 応募キャンセル
        const { error } = await supabase
          .from("applications")
          .delete()
          .match({ user_id: user.id, event_id: id });
        if (error) throw error;
        setIsApplied(false);
        alert("応募をキャンセルしました。");
      } else {
        // 応募登録
        const { error } = await supabase
          .from("applications")
          .insert({ user_id: user.id, event_id: id });
        if (error) throw error;
        setIsApplied(true);
        alert("応募が完了しました！");
      }
    } catch (error) {
      console.error("応募状態の更新エラー:", error.message);
      alert("処理に失敗しました。");
    } finally {
      setIsApplyLoading(false);
      setIsModalOpen(false);
    }
  };

  /**
   * 応募ボタンが押された時の処理
   * 状態に応じて適切な確認モーダルを表示する
   */
  const handleApplyButtonPress = e => {
    e.preventDefault();
    if (isApplyLoading || isFavoriteLoading) return;

    if (!user) {
      alert("応募するにはログインが必要です。");
      return;
    }

    if (isApplied) {
      setModalContent({
        title: "応募のキャンセル",
        body: "応募を取り消しますか？",
        confirmText: "取り消す",
        isDestructive: true,
      });
      setIsModalOpen(true);
    } else {
      setModalContent({
        title: "応募の確認",
        body: (
          <>
            「<strong>{name || "このイベント"}</strong>
            」に応募します。よろしいですか？
          </>
        ),
        confirmText: "応募する",
        isDestructive: false,
      });
      setIsModalOpen(true);
    }
  };

  return (
    <PageWrapper>
      <ActionMenu>
        <FavoriteButton
          isFavorite={isFavorite}
          onClick={handleToggleFavorite}
          disabled={isFavoriteLoading || isApplyLoading}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </FavoriteButton>
        <ApplyButton
          isApplied={isApplied}
          onClick={handleApplyButtonPress}
          disabled={isFavoriteLoading}
        >
          {isApplied ? (
            <>
              <FaCheckCircle />
              応募済み
            </>
          ) : (
            <>
              <FaRegCheckCircle />
              このボランティアに応募する
            </>
          )}
        </ApplyButton>
      </ActionMenu>

      <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />

      <MainContent>
        {/* ... (表示内容はそのまま) ... */}
        {tag && <Tag>{tag}</Tag>}
        <EventTitle>{name || "無題のイベント"}</EventTitle>
        {organaizer && (
          <Organizer>
            <FaBuilding /> {organaizer}
          </Organizer>
        )}

        <MainImage
          src={image_url || placeholderImage}
          alt={name || "イベント画像"}
          width={800}
          height={400}
          priority
        />

        {long_description && (
          <DetailSection>
            <SectionTitle>
              <FaInfoCircle /> ボランティア詳細
            </SectionTitle>
            <SectionContent>{long_description}</SectionContent>
          </DetailSection>
        )}

        {appeal && (
          <DetailSection>
            <PopCard bgColor="#fff8e1" borderColor="#ffe082">
              <IconCircle iconColor="#ff8f00">
                <FaThumbsUp />
              </IconCircle>
              <div>
                <PopCardTitle textColor="#ff6f00">
                  ボランティアの魅力
                </PopCardTitle>
                <PopCardText>{appeal}</PopCardText>
              </div>
            </PopCard>
          </DetailSection>
        )}

        {experience && (
          <DetailSection>
            <BubbleWrapper>
              <SpeakerIcon>
                <FaChalkboardTeacher />
              </SpeakerIcon>
              <BubbleContent>
                <BubbleTitle>
                  <FaLightbulb /> 得られる経験・スキル
                </BubbleTitle>
                <SectionContent>{experience}</SectionContent>
              </BubbleContent>
            </BubbleWrapper>
          </DetailSection>
        )}

        <DetailSection>
          <SectionTitle>
            <FaCalendarAlt /> 募集要項
          </SectionTitle>
          <InfoGrid>
            <InfoLabel>
              <FaCalendarAlt />
              日時
            </InfoLabel>
            <InfoValue>
              {formatDateTime(start_datetime)} 〜 {formatDateTime(end_datetime)}
            </InfoValue>
            <InfoLabel>
              <FaMapMarkerAlt />
              場所
            </InfoLabel>
            <InfoValue>{place || "未定"}</InfoValue>
            {access && (
              <>
                <InfoLabel>
                  <FaRoute />
                  アクセス
                </InfoLabel>
                <InfoValue>{access}</InfoValue>
              </>
            )}
            <InfoLabel>
              <FaYenSign />
              費用
            </InfoLabel>
            <InfoValue>
              {fee === 0 ? "無料" : fee ? `${fee.toLocaleString()}円` : "未定"}
            </InfoValue>

            <InfoLabel>
              <FaUsers />
              定員
            </InfoLabel>
            <InfoValue>{capacity ? `${capacity}名` : "特に指定なし"}</InfoValue>
          </InfoGrid>
        </DetailSection>

        {(selection_flow || belongings || clothing) && (
          <DetailSection>
            <SectionTitle>
              <FaSuitcase /> 応募情報
            </SectionTitle>
            <InfoGrid>
              {selection_flow && (
                <>
                  <InfoLabel>
                    <FaInfoCircle />
                    選考
                  </InfoLabel>
                  <InfoValue>{selection_flow}</InfoValue>
                </>
              )}
              {belongings && (
                <>
                  <InfoLabel>
                    <FaSuitcase />
                    持ち物
                  </InfoLabel>
                  <InfoValue>{belongings}</InfoValue>
                </>
              )}
              {clothing && (
                <>
                  <InfoLabel>
                    <FaTshirt />
                    服装
                  </InfoLabel>
                  <InfoValue>{clothing}</InfoValue>
                </>
              )}
            </InfoGrid>
          </DetailSection>
        )}

        {review && (
          <DetailSection>
            <SectionTitle>
              <FaComments /> 口コミ・体験談
            </SectionTitle>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "20px",
                borderRadius: "12px",
                borderLeft: "4px solid #aaa",
              }}
            >
              <SectionContent>{review}</SectionContent>
            </div>
          </DetailSection>
        )}

        {(organaizer || website_url) && (
          <DetailSection>
            <SectionTitle>
              <FaBuilding /> 主催者情報
            </SectionTitle>
            <InfoGrid>
              <InfoLabel>
                <FaBuilding />
                主催者
              </InfoLabel>
              <InfoValue>{organaizer || "情報なし"}</InfoValue>

              {website_url && (
                <>
                  <InfoLabel>
                    <FaLink />
                    公式サイト
                  </InfoLabel>
                  <InfoValue>
                    <WebsiteLink
                      href={website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {website_url}
                    </WebsiteLink>
                  </InfoValue>
                </>
              )}
            </InfoGrid>
          </DetailSection>
        )}
      </MainContent>

      <ConfirmApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleToggleApply}
        isLoading={isApplyLoading}
        title={modalContent.title}
        body={modalContent.body}
        confirmText={modalContent.confirmText}
        isDestructive={modalContent.isDestructive}
      />
    </PageWrapper>
  );
}
