/**
 * Editable content map for Baniti-Tech/khatib_naser_cpa.
 * Keys mirror sections/fields currently hardcoded in the public site.
 * Later the public site will load these from Cloud SQL / the admin API.
 */

export type FieldType = "text" | "textarea" | "list" | "image" | "phone";

export type ContentField = {
  key: string;
  label: string;
  type: FieldType;
  /** Current seed value from the live site (used as mock until SQL is wired). */
  value: string | string[];
  imageSlot?: string;
};

export type ContentSection = {
  id: string;
  title: string;
  description: string;
  fields: ContentField[];
};

export const CONTENT_SECTIONS: ContentSection[] = [
  {
    id: "brand",
    title: "מותג ופרטי קשר",
    description: "שם המשרד, סלוגן ומספרי טלפון / וואטסאפ",
    fields: [
      { key: "name", label: "שם המותג", type: "text", value: "חטיב את נאסר" },
      { key: "tagline", label: "סלוגן", type: "text", value: "רואי חשבון" },
      { key: "phoneDisplay", label: "טלפון להצגה", type: "phone", value: "054-984-3929" },
      { key: "phone", label: "טלפון (קישור tel:)", type: "phone", value: "+972549843929" },
      { key: "whatsappNumber", label: "מספר וואטסאפ", type: "phone", value: "972549843929" },
    ],
  },
  {
    id: "hero",
    title: "Hero",
    description: "כותרת ראשית, תת-כותרת ותמונת רקע",
    fields: [
      {
        key: "badge",
        label: "תווית עליונה",
        type: "text",
        value: "משרד רואי חשבון מוביל | מעל עשור של מצוינות",
      },
      { key: "headline1", label: "כותרת שורה 1", type: "text", value: "ביטחון כלכלי" },
      { key: "headline2", label: "כותרת שורה 2", type: "text", value: "לעסק שלך" },
      {
        key: "subtitle",
        label: "פסקת משנה",
        type: "textarea",
        value:
          "משרד רואי חשבון חטיב את נאסר ושות' מספק רמה אחרת של שירות — ליווי מקצועי, פתרונות טכנולוגיים מתקדמים ובסיס כלכלי יציב לצמיחה ושגשוג.",
      },
      { key: "ctaPrimary", label: "כפתור ראשי", type: "text", value: "קבלו ייעוץ חינם" },
      { key: "ctaWhatsapp", label: "כפתור וואטסאפ", type: "text", value: "שלחו הודעה בוואטסאפ" },
      {
        key: "background",
        label: "תמונת רקע",
        type: "image",
        value: "/images/office-reception.jpeg",
        imageSlot: "hero.background",
      },
    ],
  },
  {
    id: "trust",
    title: "סרגל אמון",
    description: "מספרים / סטטיסטיקות בראש האתר",
    fields: [
      { key: "stat1Value", label: "ערך 1", type: "text", value: "10+" },
      { key: "stat1Label", label: "תווית 1", type: "text", value: "שנות ניסיון מצטבר" },
      { key: "stat2Value", label: "ערך 2", type: "text", value: "30+" },
      { key: "stat2Label", label: "תווית 2", type: "text", value: "שנות מומחיות בתחום" },
      { key: "stat3Value", label: "ערך 3", type: "text", value: "100%" },
      { key: "stat3Label", label: "תווית 3", type: "text", value: "מחויבות ללקוח" },
      { key: "stat4Value", label: "ערך 4", type: "text", value: "24/7" },
      { key: "stat4Label", label: "תווית 4", type: "text", value: "זמינות בוואטסאפ" },
    ],
  },
  {
    id: "services",
    title: "שירותים",
    description: "כותרת המקטע ורשימת השירותים",
    fields: [
      { key: "eyebrow", label: "תווית", type: "text", value: "השירותים שלנו" },
      { key: "title", label: "כותרת", type: "text", value: "פתרונות פיננסיים מקיפים" },
      {
        key: "subtitle",
        label: "תיאור",
        type: "textarea",
        value:
          "משרדנו מעניק שירותי ראיית חשבון, ייעוץ מס וליווי עסקי ופיננסי לחברות, עצמאים וארגונים — תוך שילוב פתרונות טכנולוגיים מתקדמים לייעול תהליכי עבודה וקבלת החלטות מבוססות נתונים.",
      },
      {
        key: "items",
        label: "רשימת שירותים (JSON)",
        type: "textarea",
        value: JSON.stringify(
          [
            {
              title: "ביקורת ועריכת דוחות כספיים",
              description:
                "הכנת דוחות כספיים מדויקים ומקצועיים בהתאם לתקנים המחמירים ביותר.",
              icon: "chart",
            },
            {
              title: "הנהלת חשבונות",
              description:
                "ניהול שוטף ומסודר של ספרי החשבונות, כולל מעקב הכנסות והוצאות.",
              icon: "ledger",
            },
          ],
          null,
          2
        ),
      },
    ],
  },
  {
    id: "whyUs",
    title: "למה אנחנו",
    description: "ערכים ותיאור",
    fields: [
      { key: "eyebrow", label: "תווית", type: "text", value: "למה לבחור בנו" },
      { key: "title", label: "כותרת", type: "text", value: "רמה אחרת של שירות" },
      {
        key: "subtitle",
        label: "תיאור",
        type: "textarea",
        value:
          "מעל עשור של פעילות, המשרד שם לעצמו למטרה לספק ביטחון כלכלי, בסיס יציב והזדמנויות צמיחה לכל לקוח — בגישה מקצועית, אישית וחדשנית.",
      },
    ],
  },
  {
    id: "about",
    title: "אודות",
    description: "טקסט אודות ותמונת משרד",
    fields: [
      { key: "eyebrow", label: "תווית", type: "text", value: "אודות המשרד" },
      { key: "title", label: "כותרת", type: "text", value: "שותפים לדרך של הצלחה" },
      {
        key: "paragraphs",
        label: "פסקאות",
        type: "list",
        value: [
          "משרד רואי חשבון חטיב את נאסר ושות' פועל מעל לעשור, ומספק ללקוחותיו חוויית שירות ייחודית שמבוססת על מקצועיות, אמינות וחדשנות.",
          "אנחנו מאמינים שראיית חשבון היא הרבה יותר מדוחות ומספרים — זו היכולת לתת לכם ביטחון כלכלי, לבנות תשתית יציבה ולפתוח בפניכם את הדלת לצמיחה עסקית אמיתית.",
          "המשרד מלווה חברות, עצמאים וארגונים בכל שלבי הפעילות, משלב פתרונות טכנולוגיים מתקדמים ומספק ליווי עסקי ופיננסי שוטף — כדי שתוכלו להתמקד במה שחשוב באמת: ניהול ופיתוח העסק שלכם.",
        ],
      },
      {
        key: "image",
        label: "תמונה",
        type: "image",
        value: "/images/office-hallway.jpeg",
        imageSlot: "about.image",
      },
    ],
  },
  {
    id: "gallery",
    title: "גלריית משרד",
    description: "תמונות ותוויות הגלריה",
    fields: [
      { key: "eyebrow", label: "תווית", type: "text", value: "המשרד שלנו" },
      {
        key: "title",
        label: "כותרת",
        type: "text",
        value: "סביבת עבודה מקצועית ומזמינה",
      },
      {
        key: "image1",
        label: "תמונה 1 — קבלה",
        type: "image",
        value: "/images/office-reception.jpeg",
        imageSlot: "gallery.reception",
      },
      {
        key: "image2",
        label: "תמונה 2 — ישיבות",
        type: "image",
        value: "/images/office-meeting.jpeg",
        imageSlot: "gallery.meeting",
      },
      {
        key: "image3",
        label: "תמונה 3 — מרחב עבודה",
        type: "image",
        value: "/images/office-hallway.jpeg",
        imageSlot: "gallery.hallway",
      },
    ],
  },
  {
    id: "team",
    title: "הצוות",
    description: "שותפים, ביוגרפיות ותמונות",
    fields: [
      { key: "eyebrow", label: "תווית", type: "text", value: "הצוות שלנו" },
      { key: "title", label: "כותרת", type: "text", value: "הכירו את השותפים" },
      {
        key: "osamaName",
        label: "אוסמה — שם",
        type: "text",
        value: "אוסמה נאסר",
      },
      {
        key: "osamaRole",
        label: "אוסמה — תפקיד",
        type: "text",
        value: "רואה חשבון | שותף מייסד",
      },
      {
        key: "osamaBio",
        label: "אוסמה — ביוגרפיה",
        type: "textarea",
        value:
          "אוסמה מביא עמו ניסיון עמוק בניהול פיננסי ברמה האסטרטגית ביותר. לאורך הקריירה שלו שימש כסמנכ\"ל כספים ראשי בחברות גדולות, והוביל ועדות מקצועיות.",
      },
      {
        key: "osamaImage",
        label: "אוסמה — תמונה",
        type: "image",
        value: "/owner/osama.jpeg",
        imageSlot: "team.osama",
      },
      {
        key: "khalidName",
        label: "ח'אלד — שם",
        type: "text",
        value: "ח'אלד חטיב",
      },
      {
        key: "khalidRole",
        label: "ח'אלד — תפקיד",
        type: "text",
        value: "רואה חשבון | שותף מייסד",
      },
      {
        key: "khalidBio",
        label: "ח'אלד — ביוגרפיה",
        type: "textarea",
        value:
          "ח'אלד הוא ותיק בתחום עם שלושה עשורים של ניסיון בליווי חברות, עצמאים וארגונים. כיזם ובעלים של סופרמרקטים ותחנות דלק, הוא מבין את האתגרים העסקיים מהצד של בעל העסק.",
      },
      {
        key: "khalidImage",
        label: "ח'אלד — תמונה",
        type: "image",
        value: "/owner/khalid.jpeg",
        imageSlot: "team.khalid",
      },
    ],
  },
  {
    id: "contact",
    title: "צור קשר",
    description: "כותרות מקטע יצירת הקשר",
    fields: [
      { key: "eyebrow", label: "תווית", type: "text", value: "צור קשר" },
      { key: "title", label: "כותרת", type: "text", value: "בואו נדבר" },
      {
        key: "subtitle",
        label: "תיאור",
        type: "textarea",
        value:
          "מלאו את הטופס ונחזור אליכם בוואטסאפ, או צרו קשר ישירות — אנחנו כאן בשבילכם.",
      },
    ],
  },
];

export function getSection(id: string) {
  return CONTENT_SECTIONS.find((s) => s.id === id);
}
