export const extractDriveId = (driveLink) => {
  if (!driveLink) return null;
  const match = driveLink.match(/\/d\/([^/]+)/);
  return match ? match[1] : null;
};

export const getDriveThumbnailUrl = (fileId) => {
  if (!fileId) return null;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w300`;
};

export const thumbnailFor = (video) => {
  if (!video) return null;
  if (video.thumbnail && !video.thumbnail.includes('placehold.co')) {
    return video.thumbnail;
  }
  const id = extractDriveId(video.driveLink);
  if (id) return getDriveThumbnailUrl(id);
  return 'https://placehold.co/300x168/20232a/E50914?text=E-FLIX+THUMBNAIL';
};

export const formatExpireDate = (dateStr) => {
  if (!dateStr || dateStr === 'なし') return 'なし';
  if (dateStr.includes('T')) {
    return new Date(dateStr).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
  }
  return dateStr;
};
