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

// 티어 이름을 이미지 소스로 변환
export const getTierImage = (tierName) => {
  if (!tierName) {
    return tierImageMap.UNRANKED;
  }

  const normalizedTier = String(tierName).toUpperCase().trim();

  if (tierImageMap[normalizedTier]) {
    return tierImageMap[normalizedTier];
  }

  const matchingKey = Object.keys(tierImageMap).find(
    (key) => key === normalizedTier || key.replace(/\s+/g, "") === normalizedTier.replace(/\s+/g, "")
  );

  if (matchingKey) {
    return tierImageMap[matchingKey];
  }

  return tierImageMap.UNRANKED;
};

export default getTierImage;

