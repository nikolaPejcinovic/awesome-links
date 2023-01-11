import { S3 } from "aws-sdk";

export const getImageUrl = (image: FormData): string =>
  `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${image[0].name}`;

export const getImageData = async (
  filename: string
): Promise<S3.PresignedPost> => {
  try {
    const res = await fetch(`/api/upload-image?file=${filename}`);
    const imageData: S3.PresignedPost = await res.json();

    return imageData;
  } catch (e) {
    console.log(e);
  }
};

export const getImageFormData = ({ imageData, imageFile }): FormData => {
  const formData = new FormData();

  Object.entries({ ...imageData.fields, file: imageFile }).forEach(
    ([key, value]) => formData.append(key, value as string | Blob)
  );

  return formData;
};

export const handleUploadImage = async ({ imageFile }) => {
  try {
    const imageFilename = encodeURIComponent(imageFile.name);
    const imageData = await getImageData(imageFilename);

    return imageData;
  } catch (e) {
    console.log(e);
  }
};
