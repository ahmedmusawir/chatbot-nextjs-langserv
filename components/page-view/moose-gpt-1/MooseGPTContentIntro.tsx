import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import { Page } from "../../globals";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Spinner from "@/components/ui-ux/common/Spinner";
import ChatMessage from "@/components/ui-ux/moose-gpt-1/ChatMessage";
import UserInputBottom from "@/components/ui-ux/moose-gpt-1/UserInputBottom";

interface Message {
  isUser: boolean;
  text: string;
}

const MooseGPTContentIntro = () => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws");

    ws.current.onmessage = (event) => {
      const message = event.data;
      setChatMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (!lastMessage.isUser) {
          return prevMessages
            .slice(0, -1)
            .concat([{ ...lastMessage, text: lastMessage.text + message }]);
        } else {
          return [...prevMessages, { isUser: false, text: message }];
        }
      });
    };

    ws.current.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const handleChatSubmit = async (userInput: string) => {
    setIsLoading(true);
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { isUser: true, text: userInput },
      { isUser: false, text: "" }, // Add a placeholder for the AI response
    ]);

    ws.current?.send(userInput);
    setIsLoading(false);
  };

  const handleClearMessage = () => {
    setChatMessages([]);
  };

  return (
    <>
      <Head>
        <title>Moose GPTs</title>
        <meta name="description" content="This is the demo page" />
      </Head>
      <Page className={""} FULL={true} customYMargin="my-0">
        <div className="flex">
          <div className="hidden sm:block w-64 bg-gray-300 p-4">
            <button className="btn" onClick={handleClearMessage}>
              Clear Messages
            </button>
          </div>

          <div className="flex-1 bg-gray-200 p-4">
            <section className="flex flex-col h-[90vh]">
              <div className="flex items-center h-14">
                <ArrowLeftIcon className="mr-2 h-6 w-6 text-gray-600" />
                <h1 className="text-xl font-bold">MooseGPT v1</h1>
              </div>

              <div className="overflow-y-auto flex-1 bg-gray-100">
                <article className="flex justify-center p-5 mb-24 w-[100%]">
                  <section className="w-[80%]">
                    {chatMessages.map((msg, index) => (
                      <ChatMessage
                        key={index}
                        isUser={msg.isUser}
                        message={msg.text}
                      />
                    ))}
                    {isLoading && <Spinner />}
                  </section>
                </article>
              </div>

              <div className="bg-gray-200 h-21 flex justify-center items-center">
                <UserInputBottom onSubmit={handleChatSubmit} />
              </div>
            </section>
          </div>
        </div>
      </Page>
    </>
  );
};

export default MooseGPTContentIntro;
