// 場所から探すページ
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";

// Emotion
// ページ全体のコンテナ
const PageContainer = styled.div`
  padding: 24px;
  margin-bottom: 60px;
`;

// セクションタイトル
const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
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
  border: 1px solid #ddd;
  background-color: ${props => (props.isSelected ? "#007bff" : "#fff")};
  color: ${props => (props.isSelected ? "#fff" : "#333")};
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: ${props => (props.isSelected ? "#0056b3" : "#f4f4f4")};
  }
`;

// 市町村リストのコンテナ
const CityListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

// 市町村チェックボックスのラベル
const CityLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const CityCheckbox = styled.input`
  margin-right: 10px;
  width: 18px;
  height: 18px;
`;

const ButtonContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 16px 24px;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
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
    // 同じ県をもう一度クリックしたら、選択を解除
    if (selectedPrefCode === prefCode) {
      setSelectedPrefCode(null);
      setCities([]);
      setCheckedCities({});
      return;
    }

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

  return (
    <>
      <PageContainer>
        <SectionTitle>1. 都道府県を選択</SectionTitle>
        <PrefListContainer>
          {prefectures.map(pref => (
            <PrefButton
              key={pref["prefecture-code"]}
              isSelected={selectedPrefCode === pref["prefecture-code"]}
              onClick={() => handlePrefClick(pref["prefecture-code"])}
            >
              {pref.name}
            </PrefButton>
          ))}
        </PrefListContainer>

        {selectedPrefCode && (
          <>
            <SectionTitle>2. 市町村を選択</SectionTitle>
            {isLoadingCities && <p>市町村を読み込み中...</p>}

            <CityListContainer>
              {cities.map(city => (
                <CityLabel key={city["city-code"]}>
                  <CityCheckbox
                    type="checkbox"
                    checked={!!checkedCities[city["city-code"]]} // !! で true/false に変換
                    onChange={() => handleCityCheck(city["city-code"])}
                  />
                  {city.name}
                </CityLabel>
              ))}
            </CityListContainer>
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
