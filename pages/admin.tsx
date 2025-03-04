import { Controller, useForm } from "react-hook-form";
import { gql, useMutation } from "@apollo/client";
import toast, { Toaster } from "react-hot-toast";
import { getSession } from "@auth0/nextjs-auth0";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";
import { useRouter } from "next/router";
import {
  getImageUrl,
  handleUploadImage,
  getImageFormData,
} from "../utils/image";

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
  const { control, register, handleSubmit, reset } = useForm();

  const [createLink, { loading, error }] = useMutation(CreateLinkMutation, {
    onCompleted: () => reset(),
  });

  const uploadPhoto = async (e) => {
    const imageFile = e.target.files[0];
    const imageData = await handleUploadImage({ imageFile });
    const imageFormData = getImageFormData({ imageData, imageFile });

    try {
      toast.promise(
        fetch(imageData.url, {
          method: "POST",
          body: imageFormData,
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
    try {
      toast.promise(
        createLink({
          variables: {
            title,
            url,
            category,
            description,
            imageUrl: getImageUrl(image),
          },
        }),
        {
          loading: "Creating new link...",
          success: "Link successfully created!🎉",
          error: `Something went wrong 😥 Please try again -  ${error}`,
        }
      );
    } catch (e) {
      console.error(e);
    } finally {
      router.push("/");
    }
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      <Toaster />
      <h1 className="text-3xl font-medium my-5">Create a new link</h1>
      <form
        className="grid grid-cols-1 gap-y-6 shadow-lg p-8 rounded-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <label className="block">
          <span className="text-gray-700">Title</span>
          <Controller
            control={control}
            defaultValue=""
            name="title"
            rules={{ required: true }}
            render={({ field }) => (
              <input
                placeholder="Title"
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            )}
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Description</span>
          <Controller
            control={control}
            defaultValue=""
            name="description"
            rules={{ required: true }}
            render={({ field }) => (
              <input
                placeholder="Description"
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            )}
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Url</span>
          <Controller
            control={control}
            defaultValue=""
            name="url"
            rules={{ required: true }}
            render={({ field }) => (
              <input
                placeholder="https://example.com"
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            )}
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Category</span>
          <Controller
            control={control}
            defaultValue=""
            name="category"
            rules={{ required: true }}
            render={({ field }) => (
              <input
                placeholder="Name"
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            )}
          />
        </label>
        <label className="block">
          <span className="text-gray-700">
            Upload a .png or .jpg image (max 1MB).
          </span>
          <input
            {...register("image", { required: true })}
            name="image"
            type="file"
            accept="image/*"
            onChange={uploadPhoto}
          />
        </label>

        <button
          disabled={loading}
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
