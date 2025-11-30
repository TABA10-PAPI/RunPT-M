// 티어 이름을 이미지 소스로 매핑하는 유틸리티

// 티어 이미지 매핑
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

/**
 * 티어 이름을 이미지 소스로 변환
 * @param {string} tierName - 티어 이름 (예: "DIAMOND", "GOLD I", "UNRANKED")
 * @returns {any} - 이미지 소스 또는 기본 이미지
 */
export const getTierImage = (tierName) => {
  if (!tierName) {
    return tierImageMap.UNRANKED;
  }

  // 티어 이름을 대문자로 변환하고 공백 제거
  const normalizedTier = String(tierName).toUpperCase().trim();

  // 정확한 매칭
  if (tierImageMap[normalizedTier]) {
    return tierImageMap[normalizedTier];
  }

  // 부분 매칭 (예: "Diamond" -> "DIAMOND")
  const matchingKey = Object.keys(tierImageMap).find(
    (key) => key === normalizedTier || key.replace(/\s+/g, "") === normalizedTier.replace(/\s+/g, "")
  );

  if (matchingKey) {
    return tierImageMap[matchingKey];
  }

  // 매칭되지 않으면 기본 이미지 (UNRANKED)
  return tierImageMap.UNRANKED;
};

export default getTierImage;

