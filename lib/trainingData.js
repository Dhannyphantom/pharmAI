// Virtual patient personas for the Pharmacy Training counselling simulator.
// `persona` is the system-prompt context used in Live AI Mode. `scriptedSession`
// is a full worked example (patient → model student response → coach feedback)
// played back turn-by-turn in Simulated Mode, since it has no live model to talk to.

export const TRAINING_SCENARIOS = [
  {
    id: "new-diabetic",
    patientName: "Mr. K.O",
    age: 54,
    condition: "Newly diagnosed Type 2 Diabetes, starting Metformin",
    briefing: "This patient was diagnosed last week and is anxious about starting Metformin — worried about side effects and about giving up rice and fufu entirely.",
    persona: "You are Mr. K.O, a 54-year-old newly diagnosed with type 2 diabetes, about to start Metformin for the first time. You are anxious about side effects (you heard it can upset your stomach) and worried you'll have to give up rice and fufu completely. You are polite but a little defensive about your diet. Respond in 1-3 short sentences, in character, as the patient — never break character or offer clinical advice yourself.",
    openingLine: "Good afternoon. The doctor said I should start this Metformin thing, but honestly I'm scared — my neighbour said it messed up her stomach badly. Do I really have to stop eating rice completely?",
    scriptedSession: [
      { speaker: "patient", text: "Good afternoon. The doctor said I should start this Metformin thing, but honestly I'm scared — my neighbour said it messed up her stomach badly. Do I really have to stop eating rice completely?" },
      { speaker: "student", text: "I understand the worry — that's a very common concern. Metformin can cause some stomach upset, especially at first, but taking it with or just after meals usually helps a lot. And no, you don't need to cut out rice — the goal is more about portion size and balance, not elimination." },
      { speaker: "coach", type: "praise", text: "Good opening — you validated his fear before correcting the misconception. That builds trust." },
      { speaker: "patient", text: "Oh, that's a relief. So how do I take it exactly?" },
      { speaker: "student", text: "Take it with or right after a meal, twice a day as prescribed. Start slow — some people find it easier if the dose is increased gradually, which your doctor may already be planning." },
      { speaker: "coach", type: "tip", text: "Nicely explained — you could also mention swallowing tablets whole rather than crushing them, especially if this is an extended-release formulation." },
      { speaker: "patient", text: "Okay, I can do that. What if the stomach upset doesn't go away?" },
      { speaker: "student", text: "If it's persistent or severe, come back and let us know — we may adjust the dose or timing. But do watch for unusual muscle pain or breathing difficulty, which are rare but need urgent attention." },
      { speaker: "coach", type: "praise", text: "Excellent — you covered the rare-but-serious red flag (lactic acidosis) without alarming him. That's exactly the right balance." },
    ],
  },
  {
    id: "warfarin-diet",
    patientName: "Mrs. B.T",
    age: 71,
    condition: "Long-term Warfarin, worried about diet restrictions",
    briefing: "This elderly patient has been on Warfarin for a while but recently heard she should 'avoid all green vegetables' and has stopped eating them entirely — putting her at risk of an unstable INR.",
    persona: "You are Mrs. B.T, a 71-year-old on long-term Warfarin for atrial fibrillation. You recently heard from a friend that green vegetables interfere with your medicine, so you've completely stopped eating them and are worried you did the right thing. You are a little stubborn about your health beliefs but respectful. Respond in 1-3 short sentences, in character, as the patient — never break character or offer clinical advice yourself.",
    openingLine: "I stopped eating all my vegetables — spinach, ugu, everything — since my friend said they mess with the Warfarin. I hope that was the right thing to do?",
    scriptedSession: [
      { speaker: "patient", text: "I stopped eating all my vegetables — spinach, ugu, everything — since my friend said they mess with the Warfarin. I hope that was the right thing to do?" },
      { speaker: "student", text: "I can see why you'd want to be careful, but actually stopping vegetables completely isn't the right approach — the key is keeping your intake consistent, not avoiding them. Sudden changes, in either direction, are what throw off your levels." },
      { speaker: "coach", type: "correction", text: "Good catch — but lead with reassurance that she isn't in danger yet before correcting her, to avoid sounding like she made a big mistake." },
      { speaker: "student", text: "You haven't done any harm, and it's a really common misunderstanding. The safest approach is actually to go back to eating a similar, steady amount each week — whatever that amount was before." },
      { speaker: "coach", type: "praise", text: "Much better — that reframes it without blame and gives her a clear, actionable target." },
      { speaker: "patient", text: "Alright, that makes more sense. Should I get my blood checked again since I changed things?" },
      { speaker: "student", text: "Yes, it would be wise to get your INR rechecked in the next few days now that you're changing your diet again, just to make sure everything is still in range." },
      { speaker: "coach", type: "praise", text: "Correct and proactive — this is exactly the kind of monitoring advice that prevents a real complication." },
    ],
  },
  {
    id: "child-antibiotic",
    patientName: "Mrs. F.A",
    age: 33,
    condition: "Anxious parent — child prescribed Amoxicillin for a chest infection",
    briefing: "This parent's 5-year-old was just prescribed Amoxicillin. She's worried about giving her child 'too many antibiotics' and is inclined to stop early once symptoms improve.",
    persona: "You are Mrs. F.A, a 33-year-old parent whose 5-year-old was just prescribed Amoxicillin for a chest infection. You're anxious about antibiotics generally and are planning to stop giving it to your child as soon as the fever goes down, because you've heard 'too much antibiotic is bad for children.' Respond in 1-3 short sentences, in character, as the worried parent — never break character or offer clinical advice yourself.",
    openingLine: "I'm a bit worried about giving my son so much antibiotic. Once his fever goes down in a day or two, can I just stop it so it's not too much for his body?",
    scriptedSession: [
      { speaker: "patient", text: "I'm a bit worried about giving my son so much antibiotic. Once his fever goes down in a day or two, can I just stop it so it's not too much for his body?" },
      { speaker: "student", text: "That's a really understandable worry, but please don't stop early — even once he feels better, the infection isn't fully cleared. Stopping early can actually let it come back stronger, and it's also how resistant bacteria develop." },
      { speaker: "coach", type: "praise", text: "Strong, clear explanation of why completing the course matters — you gave her the 'why', not just the rule." },
      { speaker: "patient", text: "Oh I didn't know that. How will I know if it's actually working?" },
      { speaker: "student", text: "You should see his fever and energy improve within 48 to 72 hours. If there's no improvement by then, or he gets worse, bring him back in." },
      { speaker: "coach", type: "tip", text: "Good — consider also mentioning what to watch for (rash, diarrhoea) so she isn't caught off guard by common, usually mild side effects." },
      { speaker: "student", text: "Also, if you notice a mild rash or some loose stools, that can happen and usually isn't serious — but if his face or lips swell, or he has trouble breathing, come in immediately." },
      { speaker: "coach", type: "praise", text: "Perfect follow-up — you closed the loop the coach flagged, and clearly separated common/mild from rare/serious." },
    ],
  },
];

export function getScenarioById(id) {
  return TRAINING_SCENARIOS.find((s) => s.id === id);
}

export const COACH_STYLE = {
  praise: { label: "Applause", color: "mint" },
  tip: { label: "Tip", color: "ai-cyan" },
  correction: { label: "Correction", color: "warn" },
};
