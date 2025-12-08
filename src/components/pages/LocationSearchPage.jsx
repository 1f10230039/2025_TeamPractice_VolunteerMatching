// 場所から探すページ
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import Breadcrumbs from "../common/Breadcrumbs";

// --- 地域区分の定義 (JISコード順) ---
const REGIONS = [
  { name: "北海道・東北", range: [1, 7] },
  { name: "関東", range: [8, 14] },
  { name: "中部", range: [15, 23] },
  { name: "近畿", range: [24, 30] },
  { name: "中国・四国", range: [31, 39] },
  { name: "九州・沖縄", range: [40, 47] },
];

// Emotion
// ページ全体のコンテナ
const PageContainer = styled.div`
  padding: 24px;
  margin-bottom: 80px; /* 固定ボタンの分だけ余白を確保 */
`;

// セクションタイトル
const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
  color: #333;
`;

// 地域ごとのブロック
const RegionBlock = styled.div`
  margin-bottom: 24px;
`;

// 地域名の見出し (例: 関東)
const RegionLabel = styled.h3`
  font-size: 0.95rem;
  color: #555;
  font-weight: bold;
  margin-bottom: 8px;
  background-color: #f0f4f8;
  padding: 4px 10px;
  border-radius: 4px;
  display: inline-block;
`;

// 都道府県リストのコンテナ
const PrefListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// 都道府県ボタン
const PrefButton = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid ${props => (props.isSelected ? "#007bff" : "#ddd")};
  background-color: ${props => (props.isSelected ? "#007bff" : "#fff")};
  color: ${props => (props.isSelected ? "#fff" : "#333")};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => (props.isSelected ? "#0056b3" : "#f4f4f4")};
  }
`;

// 市町村リストのコンテナ
const CityListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

// 市町村チェックボックスのラベル
const CityLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: ${props => (props.isChecked ? "#e3f2fd" : "#f9f9f9")};
  border: 1px solid ${props => (props.isChecked ? "#90caf9" : "transparent")};
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const CityCheckbox = styled.input`
  margin-right: 10px;
  width: 18px;
  height: 18px;
  accent-color: #007bff;
`;

const ButtonContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 16px 24px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

// 検索ボタン
const SearchButton = styled.button`
  width: 100%;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export default function LocationSearchPage({ initialPrefectures }) {
  const router = useRouter();

  // サーバーから受け取った都道府県リスト
  const prefectures = initialPrefectures || [];

  // 状態管理 (useState)
  const [selectedPrefCode, setSelectedPrefCode] = useState(null); // 選択中の都道府県コード
  const [cities, setCities] = useState([]); // 市町村リスト
  const [isLoadingCities, setIsLoadingCities] = useState(false); // 市町村を読み込み中か

  // チェックされた市町村コードを管理する
  const [checkedCities, setCheckedCities] = useState({});

  // --- イベントハンドラ ---
  // 都道府県ボタンがクリックされた時の処理
  const handlePrefClick = async prefCode => {
    // 同じ県をもう一度クリックしたら、何もしない（あるいは選択解除ロジックを入れてもいい）
    if (selectedPrefCode === prefCode) return;

    setSelectedPrefCode(prefCode); // 選択した県をセット
    setIsLoadingCities(true); // ローディング開始
    setCities([]); // 前の市のリストをクリア
    setCheckedCities({}); // 前のチェックをクリア

    // Supabaseから「cities」テーブルを検索
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("prefecture-code", prefCode) // 選択された県のコードで絞り込む
      .order("city-code", { ascending: true }); // 市コード順

    if (error) {
      console.error("市町村の取得に失敗:", error.message);
    } else {
      setCities(data || []);
    }
    setIsLoadingCities(false); // ローディング完了
  };

  // 市町村チェックボックスが変更された時の処理
  const handleCityCheck = cityCode => {
    // checkedCitiesの状態を更新
    setCheckedCities(prev => ({
      ...prev,
      [cityCode]: !prev[cityCode], // チェック状態を反転させる
    }));
  };

  // 「この条件で検索する」ボタンが押された時の処理
  const handleSearch = () => {
    // checkedCitiesの中から、値が true (チェックされてる) ものだけを取り出す
    const selectedCodes = Object.keys(checkedCities).filter(
      code => checkedCities[code]
    );

    // 1件もチェックされてなかったら何もしない
    if (selectedCodes.length === 0) {
      alert("市町村を1つ以上選択してください。");
      return;
    }

    // 検索結果ページに、市コードをカンマ区切りで渡す
    router.push(`/search/location-results?codes=${selectedCodes.join(",")}`);
  };

  // チェックされた市の数を計算（ボタンを無効化するため）
  const selectedCityCount = Object.values(checkedCities).filter(Boolean).length;

  // パンくずリスト用データ
  const crumbs = [{ label: "場所から探す", href: "/search/location" }];

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <PageContainer>
        <SectionTitle>1. 都道府県を選択</SectionTitle>

        {/* 地域ごとにグループ化して表示 */}
        {REGIONS.map(region => {
          // この地域に含まれる都道府県を抽出
          const regionPrefs = prefectures.filter(pref => {
            const code = parseInt(pref["prefecture-code"], 10);
            return code >= region.range[0] && code <= region.range[1];
          });

          // データがない地域はスキップ
          if (regionPrefs.length === 0) return null;

          return (
            <RegionBlock key={region.name}>
              <RegionLabel>{region.name}</RegionLabel>
              <PrefListContainer>
                {regionPrefs.map(pref => (
                  <PrefButton
                    key={pref["prefecture-code"]}
                    isSelected={selectedPrefCode === pref["prefecture-code"]}
                    onClick={() => handlePrefClick(pref["prefecture-code"])}
                  >
                    {pref.name}
                  </PrefButton>
                ))}
              </PrefListContainer>
            </RegionBlock>
          );
        })}

        {/* 市町村選択エリア */}
        {selectedPrefCode && (
          <>
            <SectionTitle>2. 市町村を選択</SectionTitle>
            {isLoadingCities ? (
              <p style={{ color: "#666", padding: "20px" }}>読み込み中...</p>
            ) : (
              <CityListContainer>
                {cities.map(city => {
                  const isChecked = !!checkedCities[city["city-code"]];
                  return (
                    <CityLabel key={city["city-code"]} isChecked={isChecked}>
                      <CityCheckbox
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCityCheck(city["city-code"])}
                      />
                      {city.name}
                    </CityLabel>
                  );
                })}
              </CityListContainer>
            )}
          </>
        )}
      </PageContainer>

      <ButtonContainer>
        <SearchButton onClick={handleSearch} disabled={selectedCityCount === 0}>
          {selectedCityCount > 0
            ? `${selectedCityCount}件の市町村で検索する`
            : "この条件で検索する"}
        </SearchButton>
      </ButtonContainer>
    </>
  );
}
