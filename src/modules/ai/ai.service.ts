import axios from "axios";

import Message from "../../models/Message";
import Conversation from "../../models/Conversation";
import Agent from "../../models/Agent";
import Lead from "../../models/Lead";

import { searchKnowledge } from "../knowledge/knowledge.service";
import { processCRMIntelligence } from "../crm/crm-intelligence.service";
import { queueLeadScoreCalculation } from "../crm/lead-score.queue";
import { extractAndStoreMemory } from "../crm/customer-memory.service";

import { detectIntent } from "./intent.service";
import { executeIntent } from "./intent.executor";


// ============================================================
// Types
// ============================================================

interface AIHistoryItem {
  sender: string;
  content: string;
}


// ============================================================
// Main AI Service
// ============================================================

export async function chatWithAI(
  data: {
    tenantId: string;
    conversationId: string;
    userMessage: string;
  }
) {

  // ==========================================================
  // 1. Validate Input
  // ==========================================================

  if (!data.tenantId?.trim()) {
    throw new Error("TENANT_ID_REQUIRED");
  }

  if (!data.conversationId?.trim()) {
    throw new Error("CONVERSATION_ID_REQUIRED");
  }

  if (!data.userMessage?.trim()) {
    throw new Error("MESSAGE_REQUIRED");
  }

  const currentUserMessage =
    data.userMessage.trim();


  // ==========================================================
  // 2. Get Active Agent
  // ==========================================================

  const agent =
    await Agent.findOne({
      where: {
        tenantId: data.tenantId,
        isActive: true,
      },
    });

  if (!agent) {
    throw new Error("AGENT_NOT_ACTIVE");
  }


  // ==========================================================
  // 3. Get Conversation
  // ==========================================================

  const conversation =
    await Conversation.findOne({
      attributes: [
        "id",
        "customerId",
      ],

      where: {
        id: data.conversationId,
        tenantId: data.tenantId,
      },
    });


  if (!conversation) {
    throw new Error(
      "CONVERSATION_NOT_FOUND"
    );
  }


  // ==========================================================
  // 4. Customer ID
  // ==========================================================

  const customerId =
    conversation.customerId;


  if (!customerId) {
    throw new Error(
      "CUSTOMER_ID_NOT_FOUND"
    );
  }


  // ==========================================================
  // 5. Get Previous History
  // ==========================================================

  const allMessages =
    await Message.findAll({
      attributes: [
        "sender",
        "content",
        "createdAt",
      ],

      where: {
        tenantId: data.tenantId,

        conversationId:
          data.conversationId,
      },

      order: [
        ["createdAt", "ASC"],
      ],

      limit: 30,
    });


  // ==========================================================
  // 6. Build History
  // ==========================================================

  const history: AIHistoryItem[] =
    allMessages
      .filter(
        (message) =>
          message.sender === "USER" ||
          message.sender === "AI"
      )
      .slice(-20)
      .map(
        (message): AIHistoryItem => ({
          sender:
            message.sender,

          content:
            message.content,
        })
      );


  // ==========================================================
  // 7. Detect Intent
  // ==========================================================

  const intent =
    await detectIntent({
      message:
        currentUserMessage,

      history,
    });


  console.log(
    "========================================"
  );

  console.log(
    "AGENT:",
    agent.name
  );

  console.log(
    "CUSTOMER:",
    customerId
  );

  console.log(
    "CURRENT USER MESSAGE:",
    currentUserMessage
  );

  console.log(
    "CURRENT INTENT:",
    intent.intent
  );

  console.log(
    "PRODUCT NAME:",
    intent.productName
  );

  console.log(
    "CONFIDENCE:",
    intent.confidence
  );

  console.log(
    "========================================"
  );


  // ==========================================================
  // 8. Execute Intent + Search Knowledge
  // ==========================================================

  const [
    toolResult,
    knowledge,
  ] = await Promise.all([
    executeIntent({
      tenantId:
        data.tenantId,

      intent,
    }),

    searchKnowledge(
      data.tenantId,
      currentUserMessage
    ),
  ]);


  // ==========================================================
  // 9. CRM Intelligence
  // ==========================================================

  let crmResult:
    | Awaited<
        ReturnType<
          typeof processCRMIntelligence
        >
      >
    | null = null;


  try {

    crmResult =
      await processCRMIntelligence({
        tenantId:
          data.tenantId,

        customerId,

        intent:
          intent.intent,

        productName:
          intent.productName,

        userMessage:
          currentUserMessage,

        source:
          "AI",
      });


    console.log(
      "================ CRM INTELLIGENCE ================"
    );

    console.log(
      "CRM RESULT:",
      crmResult.reason
    );

    if (crmResult.lead) {
      console.log(
        "LEAD ID:",
        crmResult.lead.id
      );

      console.log(
        "LEAD STATUS:",
        crmResult.lead.status
      );
    }

    console.log(
      "=================================================="
    );

  } catch (error) {

    /*
     * CRM failure نباید باعث شود
     * پاسخ AI از کار بیفتد.
     */

    console.error(
      "CRM INTELLIGENCE ERROR:",
      error
    );
  }

  // ==========================================================
  // 10. Lead Scoring & Customer Memory (Async)
  // ==========================================================

  const leadId = crmResult?.lead?.id || null;

  // Extract and store customer memory
  try {
    await extractAndStoreMemory({
      tenantId: data.tenantId,
      customerId,
      userMessage: currentUserMessage,
      intent: intent.intent,
      productName: intent.productName,
    });
  } catch (error) {
    console.error("CUSTOMER MEMORY ERROR:", error);
  }

  // Queue async lead score calculation (non-blocking)
  try {
    await queueLeadScoreCalculation({
      tenantId: data.tenantId,
      customerId,
      leadId,
      triggerEvent: "new_message",
    });
  } catch (error) {
    console.error("LEAD SCORE QUEUE ERROR:", error);
  }


  // ==========================================================
  // 11. Knowledge Debug
  // ==========================================================

  console.log(
    "================ KNOWLEDGE DEBUG ================"
  );

  console.log(
    "KNOWLEDGE COUNT:",
    knowledge.length
  );

  console.log(
    "KNOWLEDGE TITLES:",
    knowledge.map(
      (item) =>
        item.title
    )
  );

  console.log(
    "=================================================="
  );


  // ==========================================================
  // 11. Knowledge First
  // ==========================================================

  const hasKnowledge =
    knowledge.length > 0;


  const knowledgeFirstIntents = [
    "general",
    "unknown",
    "shipping",
    "payment",
    "order",
    "return",
  ];


  const shouldUseKnowledgeFirst =
    knowledgeFirstIntents.includes(
      intent.intent
    );


  if (
    hasKnowledge &&
    shouldUseKnowledgeFirst
  ) {

    const bestKnowledge =
      knowledge[0];


    console.log(
      "KNOWLEDGE FIRST RESPONSE:",
      bestKnowledge.title
    );


    // --------------------------------------------------------
    // Save User Message
    // --------------------------------------------------------

    const userMessage =
      await Message.create({
        tenantId:
          data.tenantId,

        conversationId:
          data.conversationId,

        sender:
          "USER",

        content:
          currentUserMessage,

        messageType:
          "TEXT",
      });


    // --------------------------------------------------------
    // Save AI Message
    // --------------------------------------------------------

    const aiMessage =
      await Message.create({
        tenantId:
          data.tenantId,

        conversationId:
          data.conversationId,

        sender:
          "AI",

        content:
          bestKnowledge.content,

        messageType:
          "TEXT",
      });


    return {
      userMessage,
      aiMessage,
      intent,
      toolResult,
      crmResult,
      history,
    };
  }


  // ==========================================================
  // 12. Save Current User Message
  // ==========================================================

  const userMessage =
    await Message.create({
      tenantId:
        data.tenantId,

      conversationId:
        data.conversationId,

      sender:
        "USER",

      content:
        currentUserMessage,

      messageType:
        "TEXT",
    });


  // ==========================================================
  // 13. Build Tool Context
  // ==========================================================

  let toolContext = "";


  // ----------------------------------------------------------
  // General
  // ----------------------------------------------------------

  if (
    toolResult.intent ===
    "general"
  ) {

    toolContext = `
هیچ Product Tool اجرا نشده است.

این یک گفتگوی عمومی است.

درباره محصولات صحبت نکن مگر اینکه
کاربر خودش درباره محصول سؤال کند.
`;
  }


  // ----------------------------------------------------------
  // Non Product Intents
  // ----------------------------------------------------------

  else if (
    toolResult.intent === "shipping" ||
    toolResult.intent === "payment" ||
    toolResult.intent === "order" ||
    toolResult.intent === "return"
  ) {

    toolContext = `
این یک درخواست مرتبط با کسب‌وکار است.

Intent:
${toolResult.intent}

Product Tool برای این درخواست اجرا نشده است.

اطلاعات پاسخ باید از Knowledge Base
گرفته شود.

اگر Knowledge Base پاسخ کافی ندارد،
اطلاعات جدید جعل نکن.
`;
  }


  // ----------------------------------------------------------
  // Product List
  // ----------------------------------------------------------

  else if (
    toolResult.intent ===
    "product_list"
  ) {

    const products =
      toolResult.products || [];


    toolContext = `
تعداد کل محصولات فعال:

${toolResult.total ?? 0}

تعداد محصولاتی که برای نمایش برگشته:

${toolResult.returned ?? 0}

محصولات:

${products
  .map(
    (product) => `
نام:
${product.name}

SKU:
${product.sku ?? "ندارد"}

قیمت:
${product.price ?? "نامشخص"}

موجودی:
${product.stock ?? "نامشخص"}

دسته‌بندی:
${product.category ?? "ندارد"}
`
  )
  .join(
    "\n----------------\n"
  )}

اگر تعداد کل محصولات بیشتر از محصولات برگشتی است،
ادعا نکن که این لیست کامل است.
`;
  }


  // ----------------------------------------------------------
  // Single Product
  // ----------------------------------------------------------

  else if (
    toolResult.product
  ) {

    const product =
      toolResult.product;


    toolContext = `
محصول مورد درخواست:

نام:
${product.name}

SKU:
${product.sku ?? "ندارد"}

توضیحات:
${product.description ?? "ندارد"}

قیمت:
${product.price ?? "نامشخص"} ${
      product.currency
    }

قیمت قبلی:
${product.compareAtPrice ?? "ندارد"} ${
      product.currency
    }

موجودی:
${product.stock ?? "نامشخص"}

وضعیت موجودی:
${product.stockStatus}

دسته‌بندی:
${product.category ?? "ندارد"}

لینک:
${product.productUrl ?? "ندارد"}

تصویر:
${product.imageUrl ?? "ندارد"}
`;
  }


  // ----------------------------------------------------------
  // Product Not Found
  // ----------------------------------------------------------

  else if (
    !toolResult.success &&
    toolResult.message
  ) {

    toolContext = `
نتیجه سیستم:

${toolResult.message}

اطلاعات محصول را جعل نکن.
`;
  }


  // ==========================================================
  // 14. Knowledge Context
  // ==========================================================

  const knowledgeContext =
    knowledge
      .map(
        (item) => `
عنوان:
${item.title}

نوع:
${item.type}

اطلاعات:
${item.content}
`
      )
      .join(
        "\n----------------\n"
      );


  const finalKnowledgeContext =
    knowledgeContext.trim()
      ? knowledgeContext
      : "هیچ اطلاعات مرتبطی در Knowledge Base پیدا نشد.";


  // ==========================================================
  // 15. Agent Context
  // ==========================================================

  const agentName =
    agent.name?.trim() ||
    "AI Agent";

  const agentLanguage =
    agent.language?.trim() ||
    "fa";

  const agentTone =
    agent.tone?.trim() ||
    "friendly";

  const agentSystemPrompt =
    agent.systemPrompt?.trim() ||
    "شما دستیار هوشمند کسب‌وکار هستید.";


  // ==========================================================
  // 16. Final AI Prompt
  // ==========================================================

  const systemPrompt = `
تو "${agentName}" هستی.

==================================================
AGENT IDENTITY
==================================================

نام Agent:
${agentName}

زبان:
${agentLanguage}

لحن:
${agentTone}


==================================================
CUSTOM SYSTEM PROMPT
==================================================

${agentSystemPrompt}


==================================================
CURRENT USER MESSAGE
==================================================

${currentUserMessage}


==================================================
CURRENT INTENT
==================================================

${intent.intent}


==================================================
TOOL RESULT
==================================================

${toolContext || "بدون نتیجه Tool"}


==================================================
KNOWLEDGE BASE
==================================================

${finalKnowledgeContext}


==================================================
CONVERSATION HISTORY
==================================================

${
  history
    .slice(-10)
    .map(
      (item) =>
        `${item.sender}: ${item.content}`
    )
    .join("\n") ||
  "بدون سابقه"
}


==================================================
IMPORTANT RULES
==================================================

1. فقط به CURRENT USER MESSAGE پاسخ بده.

2. Conversation History فقط برای درک context
   و ارجاع‌های قبلی استفاده می‌شود.

3. سؤال فعلی را دوباره از روی History پاسخ نده.

4. هیچ اطلاعاتی را حدس نزن.

5. اطلاعات Product را فقط از TOOL RESULT بگیر.

6. اطلاعات کسب‌وکار را فقط از KNOWLEDGE BASE بگیر.

7. اگر KNOWLEDGE BASE اطلاعات مرتبط دارد،
   همان اطلاعات منبع اصلی و معتبر پاسخ است.

8. اطلاعات جدیدی به Knowledge Base اضافه نکن.

9. اگر Knowledge Base پاسخ سؤال را دارد،
   هرگز نگو اطلاعاتی ثبت نشده است.

10. اگر Knowledge Base پاسخ سؤال را دارد،
    هرگز نگو اطلاعات دقیقی وجود ندارد.

11. اگر Knowledge Base پاسخ سؤال را دارد،
    هرگز کاربر را به پشتیبانی ارجاع نده.

12. اگر Knowledge Base پاسخ سؤال را دارد،
    مستقیماً همان اطلاعات را به کاربر ارائه کن.

13. اگر Knowledge Base مرتبط نیست،
    اطلاعات کسب‌وکار را جعل نکن.

14. اگر intent برابر shipping است:
    اطلاعات ارسال را فقط از Knowledge Base ارائه کن.

15. اگر intent برابر payment است:
    اطلاعات پرداخت را فقط از Knowledge Base ارائه کن.

16. اگر intent برابر order است:
    اطلاعات سفارش را فقط از Knowledge Base ارائه کن.

17. اگر intent برابر return است:
    اطلاعات مرجوعی را فقط از Knowledge Base ارائه کن.

18. اگر intent برابر price است:
    فقط درباره قیمت محصول صحبت کن.

19. اگر intent برابر stock است:
    فقط درباره موجودی صحبت کن.

20. اگر intent برابر product_search است:
    فقط نتیجه جستجوی محصول را بیان کن.

21. اگر intent برابر product_details است:
    مشخصات محصول را از TOOL RESULT ارائه کن.

22. اگر intent برابر product_link است:
    لینک محصول را از TOOL RESULT ارائه کن.

23. اگر intent برابر product_list است:
    محصولات برگشتی را معرفی کن.

24. اگر total بیشتر از returned است،
    نگو لیست کامل محصولات را نمایش داده‌ای.

25. اگر محصول پیدا نشده،
    اطلاعات محصول را جعل نکن.

26. پاسخ کوتاه و طبیعی باشد.

27. زبان پاسخ مطابق زبان Agent و زبان کاربر باشد.

28. لحن پاسخ مطابق TONE تنظیم‌شده Agent باشد.

29. اگر کاربر فقط سلام کرد،
    فقط سلام و احوالپرسی کن.

30. اگر کاربر احوالپرسی کرد،
    طبیعی پاسخ بده و در صورت مناسب بپرس
    چگونه می‌توانی کمک کنی.

31. اگر کاربر درباره محصول سؤال نکرده،
    اطلاعات محصول را خودسرانه اضافه نکن.


==================================================
KNOWLEDGE PRIORITY
==================================================

اگر Knowledge Base اطلاعات مرتبط با سؤال فعلی دارد:

KNOWLEDGE BASE
>
AGENT SYSTEM PROMPT
>
CONVERSATION HISTORY
>
GENERAL MODEL KNOWLEDGE


اما System Prompt نباید باعث جعل
اطلاعات کسب‌وکار یا محصول شود.

اطلاعات واقعی کسب‌وکار فقط از
Knowledge Base و Tool Result می‌آید.


==================================================
END
==================================================
`;


  // ==========================================================
  // 17. Final AI Messages
  // ==========================================================

  const messages = [

    {
      role:
        "system" as const,

      content:
        systemPrompt,
    },


    ...history
      .slice(-10)
      .map(
        (message) => ({
          role:
            message.sender === "USER"
              ? ("user" as const)
              : ("assistant" as const),

          content:
            message.content,
        })
      ),


    {
      role:
        "user" as const,

      content:
        currentUserMessage,
    },

  ];


  // ==========================================================
  // 18. Environment
  // ==========================================================

  const apiKey =
    process.env.KAYA_AI_API_KEY;

  const baseUrl =
    process.env.KAYA_AI_BASE_URL;

  const model =
    process.env.KAYA_AI_MODEL ||
    "deepseek/deepseek-v4-flash";


  if (!apiKey) {
    throw new Error(
      "KAYA_AI_API_KEY_NOT_DEFINED"
    );
  }

  if (!baseUrl) {
    throw new Error(
      "KAYA_AI_BASE_URL_NOT_DEFINED"
    );
  }


  // ==========================================================
  // 19. Final AI Request
  // ==========================================================

  let response;

  try {

    response =
      await axios.post(
        `${baseUrl}/chat/completions`,

        {
          model,

          messages,

          temperature: 0.2,
        },

        {
          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${apiKey}`,
          },

          timeout: 30000,
        }
      );

  } catch (axiosError: any) {

    if (
      axiosError.response?.status === 402
    ) {

      throw new Error(
        "AI_SERVICE_PAYMENT_REQUIRED"
      );
    }


    console.error(
      "KayaAI Error:",
      axiosError.response?.data ||
      axiosError.message
    );


    throw new Error(
      "AI_SERVICE_ERROR"
    );
  }


  // ==========================================================
  // 20. AI Response
  // ==========================================================

  const aiResponse =
    response.data
      ?.choices?.[0]
      ?.message?.content;


  if (!aiResponse) {

    console.error(
      "KayaAI Response:",
      response.data
    );

    throw new Error(
      "AI_EMPTY_RESPONSE"
    );
  }


  // ==========================================================
  // 21. Save AI Message
  // ==========================================================

  const aiMessage =
    await Message.create({
      tenantId:
        data.tenantId,

      conversationId:
        data.conversationId,

      sender:
        "AI",

      content:
        aiResponse,

      messageType:
        "TEXT",
    });


  // ==========================================================
  // 22. Return
  // ==========================================================

  return {
    userMessage,

    aiMessage,

    intent,

    toolResult,

    crmResult,

    history,
  };
}