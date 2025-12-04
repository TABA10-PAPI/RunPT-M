/**
 * 프로필 이미지 유틸리티
 * - 사용자별로 일관된 프로필 이미지를 반환
 */

const profileImages = [
  require("@assets/profile/001.png"),
  require("@assets/profile/002.png"),
  require("@assets/profile/003.png"),
  require("@assets/profile/004.png"),
  require("@assets/profile/005.png"),
  require("@assets/profile/006.png"),
];

/**
 * 사용자 ID를 기반으로 프로필 이미지를 선택
 * @param {number|string} uid - 사용자 ID (없으면 랜덤)
 * @returns {ImageSource} 프로필 이미지 소스
 */
export const getProfileImage = (uid = null) => {
  if (uid === null || uid === undefined) {
    // uid가 없으면 랜덤 선택
    const randomIndex = Math.floor(Math.random() * profileImages.length);
    return profileImages[randomIndex];
  }
  
  // uid를 기반으로 일관된 이미지 선택
  const uidNumber = typeof uid === 'string' ? parseInt(uid, 10) : uid;
  const index = Math.abs(uidNumber) % profileImages.length;
  return profileImages[index];
};

export default getProfileImage;

