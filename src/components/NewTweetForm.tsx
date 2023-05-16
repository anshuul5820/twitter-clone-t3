import { useSession } from "next-auth/react";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";

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

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  if (session.status !== "authenticated") return null;

  return (
    <form className="flex flex-col gap-2 border-b px-4 py-2">
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
  if (session.status !== "authenticated") return;
  return <Form />;
};

export default NewTweetForm;
