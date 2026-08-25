import sharp from 'sharp';

const ELA_QUALITY = 90;
const LOW_THRESHOLD = 15;
const MEDIUM_THRESHOLD = 30;

const computeELA = async (imageBuffer) => {
  const originalImage = sharp(imageBuffer).ensureAlpha();
  const { width, height } = await originalImage.metadata();

  const recompressedBuffer = await sharp(imageBuffer)
    .jpeg({ quality: ELA_QUALITY })
    .toBuffer();

  const originalRaw = await sharp(imageBuffer)
    .resize(width, height)
    .raw()
    .toBuffer();

  const recompressedRaw = await sharp(recompressedBuffer)
    .resize(width, height)
    .raw()
    .toBuffer();

  const length = Math.min(originalRaw.length, recompressedRaw.length);
  let totalDifference = 0;
  let maxDifference = 0;
  let highDifferencePixelCount = 0;

  for (let i = 0; i < length; i++) {
    const diff = Math.abs(originalRaw[i] - recompressedRaw[i]);
    totalDifference += diff;
    if (diff > maxDifference) maxDifference = diff;
    if (diff > 40) highDifferencePixelCount++;
  }

  const averageDifference = totalDifference / length;
  const highDifferenceRatio = (highDifferencePixelCount / length) * 100;

  let riskLevel = 'low';
  if (averageDifference > MEDIUM_THRESHOLD || highDifferenceRatio > 5) {
    riskLevel = 'high';
  } else if (averageDifference > LOW_THRESHOLD || highDifferenceRatio > 2) {
    riskLevel = 'medium';
  }

  return {
    riskLevel,
    averageDifference: Number(averageDifference.toFixed(2)),
    maxDifference,
    highDifferenceRatio: Number(highDifferenceRatio.toFixed(2)),
  };
};

const runTamperingDetection = async (imageBuffer, mimeType) => {
  if (mimeType === 'application/pdf') {
    return null;
  }

  try {
    return await computeELA(imageBuffer);
  } catch (error) {
    return null;
  }
};

export { runTamperingDetection };