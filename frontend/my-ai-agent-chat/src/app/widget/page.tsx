"use client";



import { useEffect, useMemo, useState } from "react";

import {

  Clock3,

  Loader2,

  MapPin,

  MessageCircle,

  Phone,

  Send,

  Sparkles,

} from "lucide-react";



const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://agent-to.darkube.ir/api/v1";



function getSiteId(): string {

  if (typeof window === "undefined") {

    return "";

  }



  const params = new URLSearchParams(window.location.search);



  return (
    params.get("siteId")?.trim() ||
    params.get("site")?.trim() ||
    ""
  );

}



type ChatSettings = {

  primaryColor: string;

  secondaryColor: string;

  backgroundColor: string;

  surfaceColor: string;

  userMessageColor: string;

  aiMessageColor: string;

  textColor: string;

  borderColor: string;

  buttonTextColor: string;

  logoUrl: string | null;

  welcomeTitle: string;

  welcomeMessage: string;

  onlineLabel: string;

  responseTimeText: string;

  phone: string | null;

  address: string | null;

  inputPlaceholder: string;

  footerText: string | null;

  showPhone: boolean;

  showAddress: boolean;

  showFooter: boolean;

  quickActions: string[];

};



type Site = {

  id: string;

  siteId: string;

  domain: string;

  name: string;

  status: string;

};



type ConfigResponse = {

  success: boolean;

  site: Site;

  settings: ChatSettings;

};



type Message = {

  id: string;

  sender: "USER" | "AI";

  content: string;

};



export default function Home() {

  const [siteId, setSiteId] = useState("");



  const [config, setConfig] = useState<ConfigResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [sending, setSending] = useState(false);



  // دریافت Site ID از URL

  useEffect(() => {

    const currentSiteId = getSiteId();



    setSiteId(currentSiteId);

  }, []);



  // دریافت تنظیمات سایت

  useEffect(() => {

    if (!siteId) return;



    async function loadConfig() {

      try {

        setLoading(true);

        setError("");



        const response = await fetch(

          `${API_URL}/public/sites/${encodeURIComponent(

            siteId

          )}/config`,

          {

            cache: "no-store",

          }

        );



        if (!response.ok) {

          throw new Error("CONFIG_REQUEST_FAILED");

        }



        const data: ConfigResponse = await response.json();



        if (!data.success) {

          throw new Error("CONFIG_REQUEST_FAILED");

        }



        setConfig(data);

      } catch (err) {

        console.error("CONFIG ERROR:", err);



        setError(

          "دریافت اطلاعات فروشگاه با مشکل مواجه شد."

        );

      } finally {

        setLoading(false);

      }

    }



    loadConfig();

  }, [siteId]);



  // Visitor ID مخصوص هر سایت

  const visitorId = useMemo(() => {

    if (typeof window === "undefined" || !siteId) {

      return "";

    }



    const storageKey =

      `my_ai_agent_visitor_${siteId}`;



    let id = localStorage.getItem(storageKey);



    if (!id) {

      id =

        typeof crypto !== "undefined" &&

          crypto.randomUUID

          ? crypto.randomUUID()

          : `${Date.now()}_${Math.random()

            .toString(36)

            .substring(2)}`;



      localStorage.setItem(storageKey, id);

    }



    return id;

  }, [siteId]);



  async function sendMessage(customMessage?: string) {

    const text = (customMessage ?? message).trim();



    if (!text || sending || !config || !visitorId) {

      return;

    }



    setMessage("");



    setMessages((prev) => [

      ...prev,

      {

        id: `${Date.now()}-user`,

        sender: "USER",

        content: text,

      },

    ]);



    try {

      setSending(true);



      const response = await fetch(`${API_URL}/chat`, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          siteId,

          visitorId,

          message: text,

          channel: "WEBSITE",

        }),

      });



      const data = await response.json();



      if (!response.ok || !data.success) {

        throw new Error(

          data?.message || "CHAT_REQUEST_FAILED"

        );

      }



      setMessages((prev) => [

        ...prev,

        {

          id: `${Date.now()}-ai`,

          sender: "AI",

          content: data.message,

        },

      ]);

    } catch (err) {

      console.error("CHAT ERROR:", err);



      setMessages((prev) => [

        ...prev,

        {

          id: `${Date.now()}-error`,

          sender: "AI",

          content:

            "متأسفانه در حال حاضر امکان پاسخگویی وجود ندارد. لطفاً دوباره تلاش کنید.",

        },

      ]);

    } finally {

      setSending(false);

    }

  }



  if (loading) {

    return (

      <main className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">

        <div className="flex flex-col items-center gap-4">

          <Loader2

            size={30}

            className="animate-spin text-[#10706B]"

          />



          <span className="text-sm text-black/50">

            در حال آماده‌سازی...

          </span>

        </div>

      </main>

    );

  }



  if (error || !config) {

    return (

      <main className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-6">

        <div className="w-full max-w-md rounded-3xl bg-white border border-black/5 p-10 text-center shadow-xl">

          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">

            <MessageCircle size={26} />

          </div>



          <h1 className="text-xl font-bold text-black mb-2">

            مشکلی پیش آمد

          </h1>



          <p className="text-sm leading-7 text-black/50">

            {error}

          </p>

        </div>

      </main>

    );

  }



  const { site, settings } = config;



  const mutedText =

    `${settings.textColor}99`;



  const softText =

    `${settings.textColor}70`;



  return (

    <main

      className="min-h-screen relative flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-hidden"

      style={{

        backgroundColor:

          settings.backgroundColor,

        color: settings.textColor,

      }}

    >

      {/* Background Glow */}



      <div

        className="pointer-events-none absolute -top-48 -right-48 w-[650px] h-[650px] rounded-full blur-[150px] opacity-20"

        style={{

          backgroundColor:

            settings.primaryColor,

        }}

      />



      <div

        className="pointer-events-none absolute -bottom-48 -left-48 w-[650px] h-[650px] rounded-full blur-[150px] opacity-15"

        style={{

          backgroundColor:

            settings.secondaryColor,

        }}

      />



      {/* Chat Container */}



      <div

        className="relative w-full max-w-5xl h-[calc(100dvh-24px)] md:h-[720px] overflow-hidden rounded-[28px] md:rounded-[32px] flex flex-col"

        style={{

          backgroundColor:

            settings.surfaceColor,

          border:

            `1px solid ${settings.borderColor}`,

          boxShadow:

            `0 24px 90px -35px ${settings.primaryColor}55`,

        }}

      >

        {/* Header */}



        <header

          className="shrink-0 px-4 sm:px-6 md:px-7 py-4 flex items-center justify-between gap-4"

          style={{

            borderBottom:

              `1px solid ${settings.borderColor}`,

            backgroundColor:

              settings.surfaceColor,

          }}

        >

          <div className="flex items-center gap-3 min-w-0">

            <div className="relative shrink-0">

              <div

                className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center"

                style={{

                  background:

                    `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,

                  boxShadow:

                    `0 8px 25px -10px ${settings.primaryColor}`,

                }}

              >

                {settings.logoUrl ? (

                  <img

                    src={settings.logoUrl}

                    alt={site.name}

                    className="w-full h-full object-cover"

                  />

                ) : (

                  <span

                    className="text-lg font-bold"

                    style={{

                      color:

                        settings.buttonTextColor,

                    }}

                  >

                    {site.name?.charAt(0) || "A"}

                  </span>

                )}

              </div>



              <span

                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 animate-pulse"

                style={{

                  backgroundColor:

                    settings.primaryColor,

                  borderColor:

                    settings.surfaceColor,

                }}

              />

            </div>



            <div className="min-w-0">

              <h1

                className="font-bold text-[15px] truncate flex items-center gap-1.5"

                style={{

                  color: settings.textColor,

                }}

              >

                {site.name}



                <Sparkles

                  size={13}

                  style={{

                    color:

                      settings.primaryColor,

                  }}

                />

              </h1>



              <div className="flex items-center gap-1.5 mt-1">

                <span

                  className="w-1.5 h-1.5 rounded-full"

                  style={{

                    backgroundColor:

                      settings.primaryColor,

                  }}

                />



                <span

                  className="text-[11px]"

                  style={{

                    color: mutedText,

                  }}

                >

                  {settings.onlineLabel}

                </span>

              </div>

            </div>

          </div>



          <div

            className="hidden sm:flex items-center gap-2 rounded-full px-3 py-2 text-[11px] shrink-0"

            style={{

              color: mutedText,

              backgroundColor:

                settings.backgroundColor,

              border:

                `1px solid ${settings.borderColor}`,

            }}

          >

            <Clock3 size={13} />



            <span>

              {settings.responseTimeText}

            </span>

          </div>

        </header>



        {/* Messages */}



        <section className="flex-1 overflow-y-auto chat-scroll px-4 sm:px-6 md:px-10 py-6 md:py-8">

          <div className="max-w-3xl mx-auto min-h-full flex flex-col">

            {messages.length === 0 && (

              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 animate-fade-in">

                <div

                  className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"

                  style={{

                    backgroundColor:

                      `${settings.primaryColor}15`,

                    border:

                      `1px solid ${settings.primaryColor}30`,

                  }}

                >

                  <MessageCircle

                    size={28}

                    style={{

                      color:

                        settings.primaryColor,

                    }}

                  />

                </div>



                <h2

                  className="text-2xl md:text-3xl font-bold mb-3"

                  style={{

                    color: settings.textColor,

                  }}

                >

                  {settings.welcomeTitle}

                </h2>



                <p

                  className="text-sm leading-7 max-w-md"

                  style={{

                    color: mutedText,

                  }}

                >

                  {settings.welcomeMessage}

                </p>



                {settings.quickActions.length >

                  0 && (

                    <div className="flex flex-wrap justify-center gap-2.5 mt-7 max-w-2xl">

                      {settings.quickActions.map(

                        (action, index) => (

                          <button

                            key={`${action}-${index}`}

                            onClick={() =>

                              sendMessage(action)

                            }

                            disabled={sending}

                            className="px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"

                            style={{

                              color:

                                settings.textColor,

                              backgroundColor:

                                settings.surfaceColor,

                              border:

                                `1px solid ${settings.borderColor}`,

                            }}

                            onMouseEnter={(e) => {

                              e.currentTarget.style.borderColor =

                                settings.primaryColor;



                              e.currentTarget.style.boxShadow =

                                `0 8px 24px -14px ${settings.primaryColor}`;

                            }}

                            onMouseLeave={(e) => {

                              e.currentTarget.style.borderColor =

                                settings.borderColor;



                              e.currentTarget.style.boxShadow =

                                "none";

                            }}

                          >

                            {action}

                          </button>

                        )

                      )}

                    </div>

                  )}

              </div>

            )}



            {messages.length > 0 && (

              <div className="space-y-4 py-2">

                {messages.map((item) => {

                  const isUser =

                    item.sender === "USER";



                  return (

                    <div

                      key={item.id}

                      className={`flex items-end gap-2.5 animate-slide-up ${isUser

                          ? "justify-start"

                          : "justify-end"

                        }`}

                    >

                      {!isUser && (

                        <div

                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold"

                          style={{

                            background:

                              `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,

                            color:

                              settings.buttonTextColor,

                          }}

                        >

                          {site.name?.charAt(0) ||

                            "A"}

                        </div>

                      )}



                      <div

                        className="max-w-[88%] md:max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap"

                        style={

                          isUser

                            ? {

                              backgroundColor:

                                settings.userMessageColor,

                              color:

                                settings.textColor,

                              border:

                                `1px solid ${settings.borderColor}`,

                              borderBottomLeftRadius: 7,

                            }

                            : {

                              backgroundColor:

                                settings.aiMessageColor,

                              color:

                                settings.buttonTextColor,

                              borderBottomRightRadius: 7,

                              boxShadow:

                                `0 10px 28px -18px ${settings.primaryColor}`,

                            }

                        }

                      >

                        {item.content}

                      </div>

                    </div>

                  );

                })}



                {sending && (

                  <div className="flex items-end gap-2.5 justify-end animate-slide-up">

                    <div

                      className="rounded-2xl rounded-br-md px-5 py-3.5"

                      style={{

                        backgroundColor:

                          settings.aiMessageColor,

                        color:

                          settings.buttonTextColor,

                      }}

                    >

                      <div className="flex items-center gap-1.5">

                        <span className="typing-dot" />



                        <span

                          className="typing-dot"

                          style={{

                            animationDelay:

                              "0.15s",

                          }}

                        />



                        <span

                          className="typing-dot"

                          style={{

                            animationDelay:

                              "0.3s",

                          }}

                        />

                      </div>

                    </div>

                  </div>

                )}

              </div>

            )}

          </div>

        </section>



        {/* Input */}



        <div

          className="shrink-0 px-3.5 sm:px-5 py-3.5 md:py-4"

          style={{

            borderTop:

              `1px solid ${settings.borderColor}`,

            backgroundColor:

              settings.surfaceColor,

          }}

        >

          <div className="max-w-3xl mx-auto">

            <div

              className="flex items-end gap-2 rounded-2xl p-1.5 transition-all duration-200"

              style={{

                backgroundColor:

                  settings.backgroundColor,

                border:

                  `1px solid ${settings.borderColor}`,

              }}

              onFocusCapture={(e) => {

                e.currentTarget.style.borderColor =

                  settings.primaryColor;



                e.currentTarget.style.boxShadow =

                  `0 0 0 4px ${settings.primaryColor}18`;

              }}

              onBlurCapture={(e) => {

                e.currentTarget.style.borderColor =

                  settings.borderColor;



                e.currentTarget.style.boxShadow =

                  "none";

              }}

            >

              <textarea

                value={message}

                onChange={(e) =>

                  setMessage(e.target.value)

                }

                onKeyDown={(e) => {

                  if (

                    e.key === "Enter" &&

                    !e.shiftKey

                  ) {

                    e.preventDefault();

                    sendMessage();

                  }

                }}

                placeholder={

                  settings.inputPlaceholder

                }

                rows={1}

                disabled={sending}

                className="flex-1 min-h-10 max-h-32 resize-none bg-transparent outline-none border-none px-3 py-2.5 text-sm disabled:opacity-50"

                style={{

                  color: settings.textColor,

                }}

              />



              <button

                onClick={() => sendMessage()}

                disabled={

                  !message.trim() || sending

                }

                aria-label="ارسال پیام"

                className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"

                style={{

                  background:

                    `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,

                  color:

                    settings.buttonTextColor,

                  boxShadow: message.trim()

                    ? `0 8px 20px -8px ${settings.primaryColor}`

                    : "none",

                }}

              >

                {sending ? (

                  <Loader2

                    size={16}

                    className="animate-spin"

                  />

                ) : (

                  <Send size={16} />

                )}

              </button>

            </div>



            {settings.showFooter &&

              settings.footerText && (

                <p

                  className="text-center text-[10px] mt-2.5"

                  style={{

                    color: softText,

                  }}

                >

                  {settings.footerText}

                </p>

              )}

          </div>

        </div>



        {/* Contact Info */}



        {(settings.showPhone ||

          settings.showAddress) && (

            <div

              className="shrink-0 px-4 py-2.5"

              style={{

                borderTop:

                  `1px solid ${settings.borderColor}`,

                backgroundColor:

                  settings.surfaceColor,

              }}

            >

              <div

                className="flex flex-wrap justify-center gap-2 text-[11px]"

                style={{

                  color: mutedText,

                }}

              >

                {settings.showPhone &&

                  settings.phone && (

                    <div

                      className="flex items-center gap-1.5 rounded-full px-3 py-1"

                      style={{

                        backgroundColor:

                          settings.backgroundColor,

                        border:

                          `1px solid ${settings.borderColor}`,

                      }}

                    >

                      <Phone size={11} />



                      <span>

                        {settings.phone}

                      </span>

                    </div>

                  )}



                {settings.showAddress &&

                  settings.address && (

                    <div

                      className="flex items-center gap-1.5 rounded-full px-3 py-1"

                      style={{

                        backgroundColor:

                          settings.backgroundColor,

                        border:

                          `1px solid ${settings.borderColor}`,

                      }}

                    >

                      <MapPin size={11} />



                      <span>

                        {settings.address}

                      </span>

                    </div>

                  )}

              </div>

            </div>

          )}

      </div>



      <style jsx global>{`

        @keyframes fadeIn {

          from {

            opacity: 0;

            transform: translateY(8px);

          }



          to {

            opacity: 1;

            transform: translateY(0);

          }

        }



        @keyframes slideUp {

          from {

            opacity: 0;

            transform: translateY(10px) scale(0.98);

          }



          to {

            opacity: 1;

            transform: translateY(0) scale(1);

          }

        }



        @keyframes typingBounce {

          0%,

          60%,

          100% {

            transform: translateY(0);

            opacity: 0.5;

          }



          30% {

            transform: translateY(-4px);

            opacity: 1;

          }

        }



        .animate-fade-in {

          animation: fadeIn 0.4s ease-out both;

        }



        .animate-slide-up {

          animation: slideUp 0.3s ease-out both;

        }



        .typing-dot {

          display: inline-block;

          width: 6px;

          height: 6px;

          border-radius: 9999px;

          background: currentColor;

          animation: typingBounce 1.2s

            infinite ease-in-out;

        }



        .chat-scroll::-webkit-scrollbar {

          width: 6px;

        }



        .chat-scroll::-webkit-scrollbar-track {

          background: transparent;

        }



        .chat-scroll::-webkit-scrollbar-thumb {

          background: rgba(127, 127, 127, 0.18);

          border-radius: 9999px;

        }



        @media (max-width: 640px) {

          .chat-scroll::-webkit-scrollbar {

            width: 3px;

          }

        }

      `}</style>

    </main>

  );

}