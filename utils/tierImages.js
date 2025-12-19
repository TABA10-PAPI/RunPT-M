/**
 * 티어 이미지 유틸리티
 * - 티어 이름을 이미지 소스로 변환하는 함수 제공
 */
const tierImageMap = {
  UNRANKED: require("@assets/rank/Bronze III.png"),
  "BRONZE I": require("@assets/rank/Bronze I.png"),
  "BRONZE II": require("@assets/rank/Bronze II.png"),
  "BRONZE III": require("@assets/rank/Bronze III.png"),
  "SILVER I": require("@assets/rank/Silver I.png"),
  "SILVER II": require("@assets/rank/Silver II.png"),
  "SILVER III": require("@assets/rank/Silver III.png"),
  "GOLD I": require("@assets/rank/Gold I.png"),
  "GOLD II": require("@assets/rank/Gold II.png"),
  "GOLD III": require("@assets/rank/Gold III.png"),
  "PLATINUM I": require("@assets/rank/Platinum I.png"),
  "PLATINUM II": require("@assets/rank/Platinum II.png"),
  "PLATINUM III": require("@assets/rank/Platinum III.png"),
  DIAMOND: require("@assets/rank/Diamond.png"),
  MASTER: require("@assets/rank/Master.png"),
  CHALLENGER: require("@assets/rank/Challenger.png"),
};

// 티어 이름을 이미지 소스로 변환 (Home.js의 getTierBadge 로직과 동일)
export const getTierImage = (tierName) => {
  if (!tierName) {
    return tierImageMap["SILVER III"]; // Home.js와 동일한 기본값
  }

  const tierLower = String(tierName).toLowerCase().trim();

  // 직접 매칭 시도 (정확한 티어 이름)
  const normalizedTier = String(tierName).toUpperCase().trim();
  if (tierImageMap[normalizedTier]) {
    return tierImageMap[normalizedTier];
  }

  // Home.js와 동일한 로직: 단순 티어 이름으로 매칭
  if (tierLower === "diamond") {
    return tierImageMap.DIAMOND;
  }
  if (tierLower === "master") {
    return tierImageMap.MASTER;
  }
  if (tierLower === "challenger") {
    return tierImageMap.CHALLENGER;
  }

  // 부분 매칭: bronze, silver, gold, platinum
  if (tierLower.includes("bronze")) {
    return tierImageMap["BRONZE III"]; // Home.js와 동일: Bronze III 사용
  }
  if (tierLower.includes("silver")) {
    return tierImageMap["SILVER III"]; // Home.js와 동일: Silver III 사용
  }
  if (tierLower.includes("gold")) {
    return tierImageMap["GOLD III"]; // Home.js와 동일: Gold III 사용
  }
  if (tierLower.includes("platinum")) {
    return tierImageMap["PLATINUM III"]; // Home.js와 동일: Platinum III 사용
  }

  // 기본값 (Home.js와 동일)
  return tierImageMap["SILVER III"];
};

export default getTierImage;

