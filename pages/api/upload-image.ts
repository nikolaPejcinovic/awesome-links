import aws, { S3 } from "aws-sdk";
import { NextApiRequest, NextApiResponse } from "next";

const awsConfig: S3.ClientConfiguration = {
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.APP_AWS_SECRET_KEY,
  },
  region: process.env.APP_AWS_REGION,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const s3 = new aws.S3({ ...awsConfig });

    aws.config.update({ ...awsConfig, signatureVersion: "v4" });

    const post: S3.PresignedPost = s3.createPresignedPost({
      Bucket: process.env.APP_AWS_S3_BUCKET_NAME,
      Fields: {
        key: req.query.file,
      },
      Expires: 60,
      Conditions: [["content-length-range", 0, 5048576]],
    });

    return res.status(200).json(post);
  } catch (e) {
    console.log(e);
  }
};

export default handler;
