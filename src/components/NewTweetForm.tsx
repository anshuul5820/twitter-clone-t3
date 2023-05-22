import { useSession } from "next-auth/react";
import React, {
  FormEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import { api } from "~/utils/api";

const updateTextAreaSize = (textArea?: HTMLTextAreaElement) => {
  if (!textArea) return;
  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
};

const Form = () => {
  const session = useSession();
  const [inputValue, setInputValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();

  const inputRef = useCallback(
    (textArea: HTMLTextAreaElement) => {
      updateTextAreaSize(textAreaRef.current);
      textAreaRef.current = textArea;
    },
    [inputValue]
  );

  const trpcUtils = api.useContext();

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  const createTweet = api.tweet.create.useMutation({
    onSuccess: (newTweet) => {
      alert(newTweet.content);
      setInputValue("");

      if (session.status === "authenticated") return;

      trpcUtils.tweet.infiniteTweet.setInfiniteData({}, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;
        //oldData.pages[0] == null- no data for first page

        const newCachedTweet = {
          ...newTweet,
          likeCount: 0,
          likedByMe: false,
          user: {
            id: session.data.user.id || null,
            nane: session.data.user.name || null,
            image: session.data.user.image || null,
          },
        };
        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              tweets: [newCachedTweet, ...oldData.pages[0].tweets],
            },
            ...oldData.pageParams.slice(1),
          ],
        };
      });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createTweet.mutate({ content: inputValue });
  };

  if (session.status !== "authenticated") return null;

  return (
    <form
      className="flex flex-col gap-2 border-b px-4 py-2"
      onSubmit={handleSubmit}
    >
      <div className="flex gap-4">
        <ProfileImage src={session.data.user.image} />
        <textarea
          style={{ height: 0 }}
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
          placeholder="What's happening?"
          name=""
        />
      </div>
      <Button className="self-end">Tweet</Button>
    </form>
  );
};

const NewTweetForm = () => {
  const session = useSession();

  //if user is on the server, dont run; user!=authenticated on server
  if (session.status !== "authenticated") return null;
  return <Form />;
};

export default NewTweetForm;
