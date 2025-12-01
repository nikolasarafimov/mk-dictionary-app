// =======================
// Part-of-speech map
// =======================
export const posMap = {
  N: 'именка',
  V: 'глагол',
  A: 'придавка',
  P: 'заменка',
  R: 'прилог',
  S: 'предлог',
  C: 'сврзник',
  M: 'бројка',
  Q: 'честичка',
  I: 'интерјекција',
  Y: 'кратенка',
  X: 'резидуален',
  Z: 'интерпункција'
};

// =======================
// SUPPORTING MAPS
// =======================

// Nouns
export const nounTypeMap = { c: 'општа', p: 'сопствена' };
export const genderMap  = { m: 'машки род', f: 'женски род', n: 'среден род' };
export const numberMap  = { s: 'еднина', p: 'множина' };

// Verbs
export const verbTypeMap   = { m: 'главен', a: 'помошен', o: 'модален' };
export const aspectMap     = { p: 'несвршен', e: 'свршен' };
export const tenseMap      = {
  p: 'сегашно време',
  i: 'несвршено минато',
  a: 'аорист',
  c: 'сложено време'
};
export const personMap     = { 1: 'прво лице', 2: 'второ лице', 3: 'трето лице' };

// Adjectives
export const adjectiveTypeMap = {
  g: 'општа',
  s: 'сопственa',
};
export const adjectiveDegreeMap = {
  p: 'позитивна форма',
  c: 'компаратна (споредбена)',
  s: 'суперлативна'
};

// Pronouns
export const pronounTypeMap = {
  p: 'личен',
  d: 'демонстративен',
  i: 'недефиниран',
  q: 'прашален',
  r: 'релационен',
  x: 'рефлексивен',
  z: 'негативен',
  g: 'општ'
};

// Adverbs
export const adverbTypeMap   = {
  g: 'општ прилог',
  a: 'прилог-придавка',
  v: 'вербален прилог',
  d: 'модален прилог'
};
export const adverbDegreeMap = {
  p: 'позитивна форма',
  c: 'компаратна (споредбена)',
  s: 'суперлативна'
};

// Adpositions
export const adpositionTypeMap = { p: 'прост предлог' };
export const adpositionFormMap = { s: 'прост', c: 'сложен' };

// Conjunctions
export const conjunctionTypeMap = { c: 'координативен', s: 'субординативен' };
export const conjunctionFormMap = { s: 'прост', c: 'сложен' };

// Numerals
export const numeralFormMap = { d: 'арапска цифра', r: 'римска цифра', l: 'со букви' };

// Particles
export const particleFormMap = { s: 'проста честичка', c: 'сложена честичка' };

// Residual
export const residualTypeMap = {
  f: 'странски збор',
  t: 'типографска грешка',
  w: 'веб-локација',
  e: 'емоџи',
  h: 'хаштагови',
  a: '„@“ ознака',
  p: 'име на програма'
};


// =======================
// MAIN TAG DECODER (only one!)
// =======================
export function decodeTag(tag) {
  if (!tag) return 'Нема морфолошка ознака!';

  const letters = tag.split('');
  const pos = letters[0];
  const parts = [];

  if (posMap[pos]) parts.push(posMap[pos]);

  switch (pos) {
    case 'N': {
      const [, t, g, num] = letters;
      if (nounTypeMap[t])  parts.push(nounTypeMap[t]);
      if (genderMap[g])    parts.push(genderMap[g]);
      if (numberMap[num])  parts.push(numberMap[num]);
      break;
    }

    case 'V': {
      const [, t, asp, , tn, p, num, g] = letters;
      if (verbTypeMap[t]) parts.push(verbTypeMap[t]);
      if (aspectMap[asp]) parts.push(aspectMap[asp]);
      if (tenseMap[tn])   parts.push(tenseMap[tn]);
      if (personMap[p])   parts.push(personMap[p]);
      if (numberMap[num]) parts.push(numberMap[num]);
      if (genderMap[g])   parts.push(genderMap[g]);
      break;
    }

    case 'A': {
      const [, t, deg, g, num] = letters;
      if (adjectiveTypeMap[t])   parts.push(adjectiveTypeMap[t]);
      if (adjectiveDegreeMap[deg]) parts.push(adjectiveDegreeMap[deg]);
      if (genderMap[g])          parts.push(genderMap[g]);
      if (numberMap[num])        parts.push(numberMap[num]);
      break;
    }

    case 'P': {
      const [, t, p_, g, num] = letters;
      if (pronounTypeMap[t]) parts.push(pronounTypeMap[t]);
      if (personMap[p_])     parts.push(personMap[p_]);
      if (genderMap[g])      parts.push(genderMap[g]);
      if (numberMap[num])    parts.push(numberMap[num]);
      break;
    }

    case 'R': {
      const [, t, deg] = letters;
      if (adverbTypeMap[t])   parts.push(adverbTypeMap[t]);
      if (adverbDegreeMap[deg]) parts.push(adverbDegreeMap[deg]);
      break;
    }

    case 'S': {
      const [, t, f] = letters;
      if (adpositionTypeMap[t]) parts.push(adpositionTypeMap[t]);
      if (adpositionFormMap[f]) parts.push(adpositionFormMap[f]);
      break;
    }

    case 'C': {
      const [, t, f] = letters;
      if (conjunctionTypeMap[t]) parts.push(conjunctionTypeMap[t]);
      if (conjunctionFormMap[f]) parts.push(conjunctionFormMap[f]);
      break;
    }

    case 'M': {
      const [, f, , g] = letters;
      if (numeralFormMap[f]) parts.push(numeralFormMap[f]);
      if (genderMap[g])      parts.push(genderMap[g]);
      break;
    }

    case 'Q': {
      const [, f] = letters;
      if (particleFormMap[f]) parts.push(particleFormMap[f]);
      break;
    }

    case 'X': {
      const [, t] = letters;
      if (residualTypeMap[t]) parts.push(residualTypeMap[t]);
      break;
    }

    default:
      break;
  }

  return parts.join(', ');
}


// =======================
// Grammar Explanation
// =======================
export function getGrammarExplanation(tag) {
  return []; // placeholder, safe until we build full explanations
}