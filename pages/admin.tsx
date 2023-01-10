import { useForm } from "react-hook-form";
import { gql, useMutation } from "@apollo/client";
import toast, { Toaster } from "react-hot-toast";
import { getSession } from "@auth0/nextjs-auth0";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";
import { S3 } from "aws-sdk";
import { useRouter } from "next/router";
import { useEffect } from "react";

const CreateLinkMutation = gql`
  mutation (
    $title: String!
    $url: String!
    $description: String!
    $imageUrl: String!
    $category: String!
  ) {
    createLink(
      title: $title
      url: $url
      description: $description
      imageUrl: $imageUrl
      category: $category
    ) {
      id
      title
      url
      description
      imageUrl
      category
    }
  }
`;

const Admin = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [createLink, { loading, error }] = useMutation(CreateLinkMutation, {
    onCompleted: () => reset(),
  });

  console.log(errors);

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    const filename = encodeURIComponent(file.name);
    const res = await fetch(`/api/upload-image?file=${filename}`);
    const data: S3.PresignedPost = await res.json();
    const formData = new FormData();

    Object.entries({ ...data.fields, file }).forEach(([key, value]) =>
      formData.append(key, value as string | Blob)
    );
    console.log(data.url);
    try {
      toast.promise(
        fetch(data.url, {
          method: "POST",
          body: formData,
        }),
        {
          loading: "Uploading...",
          success: "Image successfully uploaded!",
          error: "Upload failed",
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  const onSubmit = async ({ title, url, category, description, image }) => {
    // const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${image[0].name}`;
    const imageUrl = "https://blaa.com";
    toast.error(
      `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${image[0].name}`
    );
    try {
      toast.promise(
        createLink({
          variables: { title, url, category, description, imageUrl },
        }),
        {
          loading: "Creating new link...",
          success: "Link successfully created!🎉",
          error: `Something went wrong 😥 Please try again -  ${error}`,
        }
      );
    } catch (e) {
      toast.error(e);
      console.error(e);
    } finally {
      //   router.push("/");
    }
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      {Object.keys(errors).map((k) => (
        <p>{errors[k].message}</p>
      ))}
      <Toaster />
      <h1 className="text-3xl font-medium my-5">Create a new link</h1>
      <form
        className="grid grid-cols-1 gap-y-6 shadow-lg p-8 rounded-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <label className="block">
          <span className="text-gray-700">Title</span>
          <input
            placeholder="Title"
            name="title"
            type="text"
            {...register("title", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Description</span>
          <input
            placeholder="Description"
            {...register("description", { required: true })}
            name="description"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Url</span>
          <input
            placeholder="https://example.com"
            {...register("url", { required: true })}
            name="url"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Category</span>
          <input
            placeholder="Name"
            {...register("category", { required: true })}
            name="category"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">
            Upload a .png or .jpg image (max 1MB).
          </span>
          <input
            {...register("image")}
            onChange={uploadPhoto}
            type="file"
            accept="image/png, image/jpeg"
            name="image"
          />
        </label>

        <button
          //   disabled={loading}
          type="submit"
          className="my-4 capitalize bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="w-6 h-6 animate-spin mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
              Creating...
            </span>
          ) : (
            <span>Create Link</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default Admin;

export const getServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res);

  if (!session) {
    return {
      redirect: { permanent: false, destination: "/api/auth/login" },
      props: {},
    };
  }

  const user = await prisma.user.findUnique({
    // TODO: check what select does
    select: {
      email: true,
      role: true,
    },
    where: {
      email: session.user.email,
    },
  });

  if (user.role !== Role.ADMIN) {
    return { redirect: { permanent: false, destination: "/404" }, props: {} };
  }

  return { props: {} };
};
