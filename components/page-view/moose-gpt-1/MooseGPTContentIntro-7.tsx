import Head from "next/head";
import React, { useState } from "react";
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

  // Function to handle the form submission
  const handleChatSubmit = async (userInput: string) => {
    setIsLoading(true);
    // Add user's message to the chat
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { isUser: true, text: userInput },
      { isUser: false, text: "" }, // Add a placeholder for the AI response
    ]);

    const response = await fetch("http://127.0.0.1:8000/openai/invoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: { user_input: userInput } }),
    });

    const reader = response?.body?.getReader();
    const decoder = new TextDecoder();
    let aiResponse = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        setChatMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (!lastMessage.isUser) {
            return [
              ...prevMessages.slice(0, -1),
              { isUser: false, text: aiResponse },
            ];
          } else {
            return [...prevMessages, { isUser: false, text: aiResponse }];
          }
        });
      }
    }

    setIsLoading(false);
  };

  // Function to handle clear messages
  const handleClearMessage = () => {
    setChatMessages([]);
  };

  return (
    <>
      <Head>
        <title>LANGSERVE GPTs</title>
        <meta name="description" content="This is the demo page" />
      </Head>
      <Page className={""} FULL={true} customYMargin="my-0">
        <div className="flex">
          {/* Left Sidebar Column */}
          <div className="hidden sm:block w-64 bg-gray-300 p-4">
            <button className="btn" onClick={handleClearMessage}>
              Clear Messages
            </button>
          </div>
          {/* Left Sidebar Column ENDS*/}

          {/* Right Content Column */}
          <div className="flex-1 bg-gray-200 p-4">
            {/* Main Right Content Block */}
            <section className="flex flex-col h-[90vh]">
              {/* Top Chat Block */}
              <div className="flex items-center h-14">
                <ArrowLeftIcon className="mr-2 h-6 w-6 text-gray-600" />
                <h1 className="text-xl font-bold">LANGSERVE GPT v1</h1>
              </div>

              {/* Main Chat Display Block */}
              <div className="overflow-y-auto flex-1 bg-gray-100">
                {/* User & AI Output */}
                <article className="flex justify-center p-5 mb-24 w-[100%]">
                  <section className="w-[80%]">
                    {/* Map through the chat messages and render them */}
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

              {/* User input Block */}
              <div className="bg-gray-200 h-21 flex justify-center items-center">
                <UserInputBottom onSubmit={handleChatSubmit} />
              </div>
            </section>
          </div>
          {/* Right Content Column ENDS*/}
        </div>
      </Page>
    </>
  );
};

export default MooseGPTContentIntro;
