// Illustrative example translations for common pharmacy counselling
// phrases and a handful of medication instructions, used by the Patient
// Portal's "Language & Instructions" section and the Communication module
// when Live AI Mode is off.
//
// IMPORTANT: these are simplified example translations for an educational
// demo, not verified clinical-grade translations. Always confirm meaning
// with a trained interpreter or a native-speaking colleague before using
// with a real patient — the UI surfaces this disclaimer wherever these are
// shown.

export const LANGUAGES = ["Hausa", "Yoruba", "Igbo", "Nigerian Pidgin"];

export const COMMON_PHRASES = [
  {
    en: "Take this medicine after food.",
    translations: {
      Hausa: "Ka sha wannan maganin bayan cin abinci.",
      Yoruba: "Mu oogun yi lẹ́yìn tí o bá ti jẹun.",
      Igbo: "Ṅụọ ọgwụ a mgbe iri emechara nri.",
      "Nigerian Pidgin": "Take dis medicine after you don chop.",
    },
  },
  {
    en: "Do not stop this antibiotic early, even if you feel better.",
    translations: {
      Hausa: "Kada ka daina shan wannan maganin rigakafi da wuri, ko da kana jin dadi.",
      Yoruba: "Má dá oogun apakòkòrò yi dúró láìpé, kódà tí ara rẹ bá ti yá.",
      Igbo: "Akwụsịla ọgwụ nje a n'oge, ọbụlagodi ma ị dị mma.",
      "Nigerian Pidgin": "No stop dis antibiotic before time, even if you don begin feel better.",
    },
  },
  {
    en: "This medicine may make you feel sleepy — do not drive after taking it.",
    translations: {
      Hausa: "Wannan maganin na iya sa ka jin barci — kada ka tuka mota bayan ka sha shi.",
      Yoruba: "Oogun yi le mu ọ sun oorun — má wa'kọ̀ lẹ́yìn tí o bá mu u.",
      Igbo: "Ọgwụ a nwere ike ime ka ụra na-atụ gị — akwọla ụgbọ ala mgbe ị ṅụsịrị ya.",
      "Nigerian Pidgin": "Dis medicine fit make you feel sleepy — no drive after you don take am.",
    },
  },
  {
    en: "Please come back immediately if you notice a rash or swelling.",
    translations: {
      Hausa: "Da fatan za ka dawo nan take idan ka ga kurji ko kumburi.",
      Yoruba: "Jọ̀wọ́ padà wá lẹ́sẹ̀kẹ́sẹ̀ tí o bá ṣàkíyèsí àwọ̀ tàbí wíwú.",
      Igbo: "Biko lọghachi ozugbo ma ị hụ ihe mgbaàmà ma ọ bụ mkpali.",
      "Nigerian Pidgin": "Abeg come back quick quick if you notice rash or swelling for body.",
    },
  },
  {
    en: "You have an outstanding bill at the pharmacy — please see the billing desk.",
    translations: {
      Hausa: "Kana da bashin da bai biya ba a asibiti — da fatan za ka je ofishin biyan kuɗi.",
      Yoruba: "O ní gbèsè tí ò tíì san ní ilé ìwòsàn — jọ̀wọ́ lọ sí ọ́fíìsì ìsanwó.",
      Igbo: "Ị nwere ụgwọ na-akwụghị ụgwọ n'ụlọ ọgwụ — biko gaa n'ọfịs ịkwụ ụgwọ.",
      "Nigerian Pidgin": "You get bill wey remain for hospital — abeg go meet dem for billing desk.",
    },
  },
  {
    en: "Drink plenty of water while taking this medicine.",
    translations: {
      Hausa: "Ka sha ruwa mai yawa yayin da kake shan wannan maganin.",
      Yoruba: "Mu omi púpọ̀ nígbà tí o bá ń mu oogun yi.",
      Igbo: "Ṅụọ mmiri buru ibu mgbe ị na-aṅụ ọgwụ a.",
      "Nigerian Pidgin": "Drink plenty water as you dey take dis medicine.",
    },
  },
  {
    en: "Your next appointment is very important — please don't miss it.",
    translations: {
      Hausa: "Ziyararka ta gaba tana da matukar muhimmanci — don Allah kada ka rasa ta.",
      Yoruba: "Ìpàdé rẹ tí ń bọ̀ ṣe pàtàkì gan-an — jọ̀wọ́ má ṣe pàdánù rẹ̀.",
      Igbo: "Nzukọ gị na-abịa dị oke mkpa — biko ahapụla ya.",
      "Nigerian Pidgin": "Your next appointment important well well — abeg no miss am.",
    },
  },
];

export function getCannedPhraseTranslation(phraseEn, language) {
  const match = COMMON_PHRASES.find((p) => p.en.toLowerCase() === phraseEn.trim().toLowerCase());
  return match?.translations?.[language] || null;
}

// A handful of pre-translated "how to take it" instructions for common
// medicines, so Simulated Mode has real demo content without an API call.
// Any other medicine can still be translated live via Live AI Mode.
const MEDICATION_INSTRUCTION_TRANSLATIONS = {
  metformin: {
    en: "Take with or just after meals to reduce stomach upset. Swallow tablets whole.",
    translations: {
      Hausa: "Ka sha shi tare da abinci ko jim kadan bayan cin abinci domin rage ciwon ciki. Haɗiye kwayoyin gaba ɗaya.",
      Yoruba: "Mu u pẹ̀lú oúnjẹ tàbí lẹ́yìn tí o bá ti jẹun kí ikùn má bàa dàrú. Gbé oogun náà mì lódindi.",
      Igbo: "Ṅụọ ya ka ị na-eri nri ma ọ bụ ozugbo iri nri iji belata mgbu afọ. Loo ọgwụ ahụ dum n'otu oge.",
      "Nigerian Pidgin": "Take am with food or after you don chop so your belle no go pain you. Swallow di tablet as e be.",
    },
  },
  warfarin: {
    en: "Take at the same time each day. Keep your diet consistent and report any unusual bleeding or bruising immediately.",
    translations: {
      Hausa: "Ka sha shi a kan lokaci guda kowace rana. Ka kiyaye tsarin cin abincinka daidai kuma ka gaya wa likita nan take idan ka ga zubar jini ko baƙar fata da ba a saba gani ba.",
      Yoruba: "Mu u ní àkókò kan náà lójoojúmọ́. Jẹ oúnjẹ rẹ déédéé, kí o sìròyìn ẹ̀jẹ̀ tí kò dá tàbí ọgbẹ́ lẹ́sẹ̀kẹ́sẹ̀.",
      Igbo: "Ṅụọ ya n'otu oge kwa ụbọchị. Debe nri gị ka ọ na-agagharị agagharị ma kọọ ozugbo ma ọ bụrụ na ọbara na-agba n'ụzọ na-adịghị mma.",
      "Nigerian Pidgin": "Take am di same time every day. Make your food no dey change up and down, and report quick if you see strange bleeding or bruise.",
    },
  },
  amoxicillin: {
    en: "Take all the tablets, spaced evenly through the day, even after you start feeling better.",
    translations: {
      Hausa: "Ka sha dukkan kwayoyin, a tsakanin lokutan da aka tsara, ko da kana jin dadi.",
      Yoruba: "Mu gbogbo oogun náà, ní àkókò tí a yàn, kódà tí ara rẹ bá ti yá.",
      Igbo: "Ṅụọ ọgwụ niile, n'oge a kara aka, ọbụlagodi mgbe ahụ dị gị mma.",
      "Nigerian Pidgin": "Finish all di tablets, take dem well spread for di day, even if you don begin feel better.",
    },
  },
};

export function getCannedMedicationTranslation(drugName, language) {
  const key = Object.keys(MEDICATION_INSTRUCTION_TRANSLATIONS).find((k) => drugName.toLowerCase().includes(k));
  if (!key) return null;
  const entry = MEDICATION_INSTRUCTION_TRANSLATIONS[key];
  return { en: entry.en, translated: entry.translations[language] || null };
}

// Sample things a patient might commonly say back to a pharmacist, used by
// the Communication module's "Simulate Listening" feature — real speech
// recognition for Hausa/Yoruba/Igbo/Pidgin isn't reliably available in the
// browser, so this demonstrates the intended patient-to-English direction
// with representative example replies rather than live audio capture.
export const PATIENT_COMMON_REPLIES = [
  {
    en: "I have not been feeling any better since I started the medicine.",
    translations: {
      Hausa: "Ban ji sauki ba tun bayan na fara shan maganin.",
      Yoruba: "Kò sí ìyípadà kankan láti ìgbà tí mo ti bẹ̀rẹ̀ oogun náà.",
      Igbo: "Adịghị m enwe mgbake kemgbe m malitere ịṅụ ọgwụ a.",
      "Nigerian Pidgin": "I no dey feel better since I begin take di medicine.",
    },
  },
  {
    en: "I forgot to take today's dose.",
    translations: {
      Hausa: "Na manta in sha maganin na yau.",
      Yoruba: "Mo gbàgbé mu oogun mi lónìí.",
      Igbo: "Echefuru m ịṅụ ọgwụ m taa.",
      "Nigerian Pidgin": "I forget to take my medicine today.",
    },
  },
  {
    en: "I don't have enough money to pay the bill right now.",
    translations: {
      Hausa: "Ba ni da isasshen kuɗi da zan biya bashin a yanzu.",
      Yoruba: "Owó tí mo ní kò tó láti san gbèsè náà ní báyìí.",
      Igbo: "Enweghị m ego zuru ezu ịkwụ ụgwọ ahụ ugbu a.",
      "Nigerian Pidgin": "I no get enough money to pay di bill now now.",
    },
  },
  {
    en: "This medicine is making me feel dizzy.",
    translations: {
      Hausa: "Wannan maganin yana sa ni jin jiri.",
      Yoruba: "Oogun yi ń mú kí orí yí mi.",
      Igbo: "Ọgwụ a na-eme ka isi na-agba m.",
      "Nigerian Pidgin": "Dis medicine dey make my head dey turn.",
    },
  },
  {
    en: "I don't understand how to take this medicine.",
    translations: {
      Hausa: "Ban gane yadda zan sha wannan maganin ba.",
      Yoruba: "Mi ò yé mi bí mo ṣe lè mu oogun yi.",
      Igbo: "Aghọtaghị m otu m ga-esi ṅụọ ọgwụ a.",
      "Nigerian Pidgin": "I no understand how to take dis medicine.",
    },
  },
  {
    en: "Thank you, I feel much better today.",
    translations: {
      Hausa: "Na gode, ina jin dadi sosai a yau.",
      Yoruba: "O ṣeun, ara mi yá gidigidi lónìí.",
      Igbo: "Daalụ, ahụ dị m mma nke ukwuu taa.",
      "Nigerian Pidgin": "Thank you, I dey feel better well well today.",
    },
  },
];

export function getRandomPatientReply(language, excludeEn) {
  const pool = PATIENT_COMMON_REPLIES.filter((r) => r.en !== excludeEn);
  const list = pool.length ? pool : PATIENT_COMMON_REPLIES;
  const pick = list[Math.floor(Math.random() * list.length)];
  return { en: pick.en, original: pick.translations[language] || pick.en };
}
