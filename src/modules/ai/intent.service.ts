import axios from "axios";

export type Intent =
  | "general"
  | "price"
  | "stock"
  | "product_list"
  | "product_search"
  | "product_details"
  | "product_link"
  | "shipping"
  | "payment"
  | "order"
  | "return"
  | "unknown";

export interface IntentResult {
  intent: Intent;
  productName: string | null;
  confidence: number;
}

// ============================================================
// Normalize Intent
// ============================================================

function normalizeIntent(
  intent: unknown
): Intent {
  const validIntents: Intent[] = [
    "general",
    "price",
    "stock",
    "product_list",
    "product_search",
    "product_details",
    "product_link",
    "shipping",
    "payment",
    "order",
    "return",
    "unknown",
  ];

  if (
    typeof intent === "string" &&
    validIntents.includes(
      intent as Intent
    )
  ) {
    return intent as Intent;
  }

  return "unknown";
}

// ============================================================
// Normalize Product Name
// ============================================================

function normalizeProductName(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const result = value
    .trim()
    .replace(/\s+/g, " ");

  return result.length > 0
    ? result
    : null;
}

// ============================================================
// Normalize Confidence
// ============================================================

function normalizeConfidence(
  value: unknown
): number {
  if (
    typeof value !== "number" ||
    Number.isNaN(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, value)
  );
}

// ============================================================
// Detect Intent
// ============================================================

export async function detectIntent(
  data: {
    message: string;
    history?: Array<{
      sender: string;
      content: string;
    }>;
  }
): Promise<IntentResult> {
  // ==========================================================
  // Environment
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
  // Current Message
  // ==========================================================

  const currentMessage =
    data.message.trim();

  // ==========================================================
  // History
  //
  // Only previous messages are used.
  // Current message is NOT added here.
  // ==========================================================

  const historyText =
    data.history
      ?.filter(
        (item) =>
          item.sender === "USER" ||
          item.sender === "AI"
      )
      .slice(-10)
      .map(
        (item) =>
          `${item.sender}: ${item.content}`
      )
      .join("\n") ||
    "بدون تاریخچه";

  // ==========================================================
  // System Prompt
  // ==========================================================

  const systemPrompt = `
تو یک Intent Classifier حرفه‌ای برای
یک Business AI Agent هستی.

وظیفه تو فقط تشخیص Intent مربوط به
CURRENT USER MESSAGE است.

هرگز پاسخ نهایی به کاربر تولید نکن.

هرگز سؤال قبلی را پاسخ نده.

هرگز توضیح اضافه نده.

فقط JSON معتبر برگردان.

==================================================
INTENTS
==================================================

1. general

برای:

- سلام
- احوالپرسی
- تشکر
- خداحافظی
- گفتگوی عادی
- سؤال عمومی که مربوط به محصول،
  سفارش، پرداخت، ارسال یا مرجوعی نیست

مثال:

"سلام"

"چطوری؟"

"ممنون"

"خوبی؟"


==================================================

2. price

برای سؤال درباره قیمت یک محصول.

مثال:

"آیفون 17 پرو چنده؟"

"قیمت آیفون 17 پرو چقدره؟"

"این محصول چند تومنه؟"

"قیمتش چقدره؟"


==================================================

3. stock

برای سؤال درباره موجودی یا تعداد
یک محصول.

مثال:

"آیفون 17 پرو موجوده؟"

"چندتا داری؟"

"چند عدد موجود داری؟"

"موجودیش چقدره؟"


اگر سؤال کوتاه باشد و محصول در History
مشخص باشد، productName را از History استخراج کن.

مثال:

USER: آیفون 17 پرو چنده؟
AI: قیمتش 120 میلیون تومنه.

USER: چندتا داری؟

نتیجه:

{
  "intent": "stock",
  "productName": "آیفون 17 پرو"
}


==================================================

4. product_list

برای درخواست لیست محصولات.

مثال:

"چه محصولاتی دارید؟"

"چه کالاهایی دارید؟"

"محصولات موجود چیه؟"

"لیست محصولات رو بده"

"چه گوشی‌هایی دارید؟"


==================================================

5. product_search

برای اینکه بفهمیم یک محصول مشخص
وجود دارد یا نه.

مثال:

"آیفون 18 دارید؟"

"سامسونگ S26 دارید؟"

"این محصول رو دارید؟"

"آیفون 17 پرو موجود دارید؟"


تفاوت مهم:

اگر کاربر فقط درباره وجود یک محصول
سؤال کند:

product_search

اگر درباره تعداد موجودی آن محصول سؤال کند:

stock


==================================================

6. product_details

برای مشخصات یا توضیحات محصول.

مثال:

"مشخصات آیفون 17 پرو چیه؟"

"درباره آیفون 17 پرو توضیح بده"

"این محصول چه مشخصاتی داره؟"

"رمش چقدره؟"

"حافظه‌اش چقدره؟"


==================================================

7. product_link

برای درخواست لینک محصول.

مثال:

"لینکش رو بده"

"لینک محصول رو می‌فرستی؟"

"لینک آیفون 17 پرو رو بده"

"از کجا ببینمش؟"


اگر محصول در History مشخص باشد،
productName را از History استخراج کن.


==================================================

8. shipping

برای سؤال درباره ارسال سفارش.

مثال:

"شرایط ارسال چیه؟"

"ارسال چطوریه؟"

"چند روزه میرسه؟"

"هزینه ارسال چقدره؟"

"به تهران ارسال دارید؟"

"به شهرستان هم می‌فرستید؟"

"سفارش چقدر طول میکشه برسه؟"


==================================================

9. payment

برای سؤال درباره پرداخت.

مثال:

"چطوری پرداخت کنم؟"

"روش پرداخت چیه؟"

"پرداخت در محل دارید؟"

"میشه کارت به کارت کرد؟"

"چه روش‌هایی برای پرداخت دارید؟"

"درگاه پرداخت دارید؟"


==================================================

10. order

برای سؤال درباره سفارش کاربر.

مثال:

"سفارشم کجاست؟"

"سفارشم چی شد؟"

"وضعیت سفارشم چیه؟"

"سفارشم ارسال شده؟"

"کی سفارشم میرسه؟"

"شماره سفارش من چیه؟"

"پیگیری سفارشم رو میخوام"


==================================================

11. return

برای سؤال درباره مرجوعی، تعویض
یا بازگشت کالا.

مثال:

"شرایط مرجوعی چیه؟"

"میشه کالا رو پس بدم؟"

"تعویض دارید؟"

"چطور سفارشم رو مرجوع کنم؟"

"تا چند روز امکان مرجوعی هست؟"

"کالای خراب رو میشه پس داد؟"


==================================================

12. unknown

وقتی Intent با اطمینان کافی مشخص نیست.


==================================================
IMPORTANT RULES
==================================================

RULE 1:

CURRENT USER MESSAGE همیشه مهم‌تر
از History است.


RULE 2:

History فقط برای فهم context استفاده می‌شود.


RULE 3:

اگر کاربر سلام کرد:

"سلام چطوری؟"

حتماً:

intent = general

حتی اگر در History درباره محصول صحبت شده باشد.


RULE 4:

اگر کاربر گفت:

"آیفون 17 پرو چنده؟"

نتیجه:

intent = price

productName = آیفون 17 پرو


RULE 5:

اگر بعداً گفت:

"چندتا داری؟"

از History محصول را پیدا کن:

intent = stock

productName = آیفون 17 پرو


RULE 6:

اگر کاربر گفت:

"آیفون 18 هم دارید؟"

نتیجه:

intent = product_search

productName = آیفون 18


RULE 7:

اگر کاربر گفت:

"شرایط ارسال چطوره؟"

نتیجه:

intent = shipping

productName = null


RULE 8:

اگر کاربر گفت:

"روش پرداخت چیه؟"

نتیجه:

intent = payment

productName = null


RULE 9:

اگر کاربر گفت:

"سفارشم کجاست؟"

نتیجه:

intent = order

productName = null


RULE 10:

اگر کاربر گفت:

"شرایط مرجوعی چیه؟"

نتیجه:

intent = return

productName = null


RULE 11:

shipping با order متفاوت است.

"چند روز طول میکشه سفارش برسه؟"

اگر درباره زمان کلی ارسال فروشگاه باشد:

shipping

اگر درباره سفارش شخصی کاربر باشد:

order


RULE 12:

product_search با stock متفاوت است.

"آیفون 17 پرو دارید؟"

product_search

"آیفون 17 پرو چندتا موجود دارید؟"

stock


RULE 13:

اگر سؤال درباره محصول مشخصی است،
productName را استخراج کن.


RULE 14:

اگر محصول در سؤال فعلی وجود ندارد،
اما از History کاملاً مشخص است،
از History استفاده کن.


RULE 15:

اگر محصول از History قابل تشخیص نیست:

productName = null


RULE 16:

confidence باید عددی بین 0 و 1 باشد.


==================================================
CURRENT USER MESSAGE
==================================================

${currentMessage}


==================================================
RECENT HISTORY
==================================================

${historyText}


==================================================
OUTPUT
==================================================

فقط JSON معتبر برگردان:

{
  "intent": "general",
  "productName": null,
  "confidence": 0.99
}

هیچ Markdown یا متن دیگری ننویس.
`;

  // ==========================================================
  // AI Request
  // ==========================================================

  const response =
    await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,

        messages: [
          {
            role: "system",
            content:
              systemPrompt,
          },
          {
            role: "user",
            content:
              currentMessage,
          },
        ],

        temperature: 0,

        response_format: {
          type: "json_object",
        },
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

  // ==========================================================
  // Extract Response
  // ==========================================================

  const content =
    response.data
      ?.choices?.[0]
      ?.message?.content;

  if (!content) {
    throw new Error(
      "INTENT_EMPTY_RESPONSE"
    );
  }

  // ==========================================================
  // Parse JSON
  // ==========================================================

  let parsed: any;

  try {
    parsed =
      JSON.parse(content);
  } catch (error) {
    console.error(
      "Invalid Intent JSON:",
      content
    );

    throw new Error(
      "INTENT_INVALID_JSON"
    );
  }

  // ==========================================================
  // Normalize Result
  // ==========================================================

  const normalizedIntent =
    normalizeIntent(
      parsed.intent
    );

  const productName =
    normalizeProductName(
      parsed.productName
    );

  const confidence =
    normalizeConfidence(
      parsed.confidence
    );

  // ==========================================================
  // Debug
  // ==========================================================

  console.log(
    "================ INTENT DEBUG ================"
  );

  console.log(
    "MESSAGE:",
    currentMessage
  );

  console.log(
    "INTENT:",
    normalizedIntent
  );

  console.log(
    "PRODUCT:",
    productName
  );

  console.log(
    "CONFIDENCE:",
    confidence
  );

  console.log(
    "================================================"
  );

  // ==========================================================
  // Return
  // ==========================================================

  return {
    intent:
      normalizedIntent,

    productName,

    confidence,
  };
}