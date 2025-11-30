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

//Noun
export const nounTypeMap = { c: 'општа', p: 'сопствена' };
export const genderMap  = { m: 'машки род', f: 'женски род', n: 'среден род' };
export const numberMap  = { s: 'еднина', p: 'множина' };

//Verb
export const verbTypeMap   = { m: 'главен', a: 'помошен', o: 'модален' };
export const aspectMap     = { p: 'несвршен', e: 'свршен' };
export const tenseMap      = {
  p: 'сегашно време',
  i: 'несвршено минато',
  a: 'аорист',
  c: 'сложено време'
};
export const personMap     = { 1: 'прво лице', 2: 'второ лице', 3: 'трето лице' };

//Adjective
export const adjectiveTypeMap = {
  g: 'општа',
  s: 'сопственa',
};
export const adjectiveDegreeMap = {
  p: 'позитивна форма',
  c: 'компаратна (споредбена)',
  s: 'суперлативна'
};

//Pronoun
export const pronounTypeMap = {
  p: 'личен',
  d: 'демонстративен',
  i: 'недефиниран',
  q: 'прашање',
  r: 'релационен',
  x: 'рефлексивен',
  z: 'негативен',
  g: 'општ'
};

//Adverb
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

//Adposition
export const adpositionTypeMap = { p: 'прост предлог' };
export const adpositionFormMap = { s: 'прост', c: 'сложен' };

//Conjunction
export const conjunctionTypeMap = { c: 'координативен', s: 'субординативен' };
export const conjunctionFormMap = { s: 'прост', c: 'сложен' };

// Numeral
export const numeralFormMap = { d: 'арапска цифра', r: 'римска цифра', l: 'со букви' };

//Particle
export const particleFormMap = { s: 'проста честичка', c: 'сложена честичка' };

//Residual
export const residualTypeMap = {
  f: 'странски збор',
  t: 'типографска грешка',
  w: 'веб-локација',
  e: 'емоџи',
  h: 'хаштагови',
  a: '„@“ ознака',
  p: 'име на програма'
};

export function decodeTag(tag) {
  if (!tag) return 'Нема морфолошка ознака!';
  const letters = tag.split('');
  const pos = letters[0];
  const parts = [];

  if (posMap[pos]) parts.push(posMap[pos]);

  switch (pos) {
    case 'N': {
      const [, t, g, num, cs, df] = letters;
      if (nounTypeMap[t])         parts.push(nounTypeMap[t]);
      if (genderMap[g])           parts.push(genderMap[g]);
      if (numberMap[num])         parts.push(numberMap[num]);
      break;
    }
    case 'V': {
      const [, t, asp, vf, tn, p, num, g, neg] = letters;
      if (verbTypeMap[t])      parts.push(verbTypeMap[t]);
      if (aspectMap[asp])      parts.push(aspectMap[asp]);
      if (tenseMap[tn])        parts.push(tenseMap[tn]);
      if (personMap[p])        parts.push(personMap[p]);
      if (numberMap[num])      parts.push(numberMap[num]);
      if (genderMap[g])        parts.push(genderMap[g]);
      break;
    }
    case 'A': {
      const [, t, g, num, df] = letters;
      if (adjectiveTypeMap[t])    parts.push(adjectiveTypeMap[t]);
      if (adjectiveDegreeMap[g])  parts.push(adjectiveDegreeMap[g]);
      if (genderMap[num])         parts.push(genderMap[num]);
      if (numberMap[num])         parts.push(numberMap[num]);
      break;
    }
    case 'P': {
      const [, t, p_, g, num, cs, cl, df] = letters;
      if (pronounTypeMap[t])     parts.push(pronounTypeMap[t]);
      if (personMap[p_])         parts.push(personMap[p_]);
      if (genderMap[g])          parts.push(genderMap[g]);
      if (numberMap[num])        parts.push(numberMap[num]);
      break;
    }
    case 'R': {
      const [, t, d] = letters;
      if (adverbTypeMap[t])       parts.push(adverbTypeMap[t]);
      if (adverbDegreeMap[d])     parts.push(adverbDegreeMap[d]);
      break;
    }
    case 'S': {
      const [, t, f] = letters;
      if (adpositionTypeMap[t])   parts.push(adpositionTypeMap[t]);
      if (adpositionFormMap[f])   parts.push(adpositionFormMap[f]);
      break;
    }
    case 'C': {
      const [, t, f] = letters;
      if (conjunctionTypeMap[t])  parts.push(conjunctionTypeMap[t]);
      if (conjunctionFormMap[f])  parts.push(conjunctionFormMap[f]);
      break;
    }
    case 'M': {
      const [, f, t, g, df] = letters;
      if (numeralFormMap[f])      parts.push(numeralFormMap[f]);
      if (genderMap[g])           parts.push(genderMap[g]);
      break;
    }
    case 'Q': {
      const [, f] = letters;
      if (particleFormMap[f])     parts.push(particleFormMap[f]);
      break;
    }
    case 'X': {
      const [, t] = letters;
      if (residualTypeMap[t])     parts.push(residualTypeMap[t]);
      break;
    }
    case 'I':
    case 'Y':
    case 'Z':
    default:
      break;
  }

  return parts.join(', ');
}