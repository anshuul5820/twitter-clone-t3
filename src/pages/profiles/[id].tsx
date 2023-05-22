import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import ErrorPage from "next/error";
import Link from "next/link";
import IconHoverEffect from "~/components/IconHoverEffect";
import { VscArrowLeft } from "react-icons/vsc";
import ProfileImage from "~/components/ProfileImage";
import InfiniteTweetList from "~/components/InfiniteTweetList";
import Button from "~/components/Button";
import { useSession } from "next-auth/react";

/**
 * 2 ways to render this page:
 * ssr
 * incremental ssg
 */

const pluralRules = new Intl.PluralRules();
const getPlural = (number: number, singular: string, plural: string) =>
  pluralRules.select(number) === "one" ? singular : plural;

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  id,
}) => {
  const { data: profile } = api.profile.getById.useQuery({ id });
  const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
    { userId: id },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const trpcUtils = api.useContext();
  const toggleFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ addedFollow }) => {
      trpcUtils.profile.getById.setData({ id }, (oldData) => {
        if (!oldData) return;
        const countModifier = addedFollow ? 1 : -1;
        return {
          ...oldData,
          isFollowing: addedFollow,
          followersCount: oldData.followersCount + countModifier,
        };
      });
    },
  });

  if (!profile || !profile.name) return <ErrorPage statusCode={404} />;
  return (
    <>
      <Head>
        <title>{`Twitter clone ${profile.name}`}</title>
      </Head>
      <header className="flex-center sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2">
        <Link href=".." className="mr-2">
          <IconHoverEffect>
            <VscArrowLeft className="h-6 w-6" />
          </IconHoverEffect>
        </Link>
        <ProfileImage src={profile.image} className="flex-shrink-0" />
        <div className="ml-2 flex-grow">
          <h1 className="text-lg font-bold">{profile.name}</h1>
          <div className="text-gray-500">
            {profile.tweetsCount}{" "}
            {getPlural(profile.tweetsCount, "Tweet", "Tweets")}
            {profile.followersCount}{" "}
            {getPlural(profile.followersCount, "Follower", "Followers")}
            {profile.followsCount}
            {" Follows"}
          </div>
        </div>
        <FollowButton
          isFollowing={profile.isFollowing}
          isLoading={toggleFollow.isLoading}
          userId={id}
          onClick={() => toggleFollow.mutate({ userId: id })}
        />
      </header>
      <main>
        <InfiniteTweetList
          tweets={
            (tweets &&
              tweets.data &&
              tweets.data.pages?.flatMap((page) => page.tweets)) ??
            []
          }
          isError={tweets.isError}
          isLoading={tweets.isLoading}
          hasMore={tweets.hasNextPage ?? false}
          fetchNewTweets={tweets.fetchNextPage}
        />
      </main>

      {profile.name}
    </>
  );
};

const FollowButton = ({
  userId,
  isFollowing,
  isLoading,
  onClick,
}: {
  userId: string;
  isFollowing: boolean;
  isLoading: boolean;
  onClick: () => void;
}) => {
  const session = useSession();

  if (session.status !== "authenticated" || session.data.user.id === userId)
    return null;

  return (
    <Button disabled={isLoading} onClick={onClick} small gray={isFollowing}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};

//what pages to generate
export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [], //dont generate any page by default
    fallback: "blocking", //dont send page to client; generate first and then cache
  };
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const id = context.params?.id;
  if (!id) return { redirect: { destination: "/" } };

  const ssg = ssgHelper();
  await ssg.profile.getById.prefetch({ id });

  //trpcstate->rehydrates without calling backend
  return { props: { id, trpcState: ssg.dehydrate() } };
}

export default ProfilePage;
