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
  Z: 'интерпункција',
}

export const nounTypeMap = {
  c: 'општа',
  p: 'сопствена',
}

export const genderMap = {
  m: 'машки род',
  f: 'женски род',
  n: 'среден род',
}

export const numberMap = {
  s: 'еднина',
  p: 'множина',
}

export const verbTypeMap = {
  m: 'главен',
  a: 'помошен',
  o: 'модален',
}

export const aspectMap = {
  p: 'несвршен',
  e: 'свршен',
}

export const tenseMap = {
  p: 'сегашно време',
  i: 'несвршено минато',
  a: 'аорист',
  c: 'сложено време',
}

export const personMap = {
  1: 'прво лице',
  2: 'второ лице',
  3: 'трето лице',
}

export const adjectiveTypeMap = {
  g: 'општа',
  s: 'сопствена',
}

export const adjectiveDegreeMap = {
  p: 'позитивна форма',
  c: 'компаратна (споредбена)',
  s: 'суперлативна',
}

export const pronounTypeMap = {
  p: 'личен',
  d: 'демонстративен',
  i: 'недефиниран',
  q: 'прашален',
  r: 'релационен',
  x: 'рефлексивен',
  z: 'негативен',
  g: 'општ',
}

export const adverbTypeMap = {
  g: 'општ прилог',
  a: 'прилог-придавка',
  v: 'вербален прилог',
  d: 'модален прилог',
}

export const adverbDegreeMap = {
  p: 'позитивна форма',
  c: 'компаратна (споредбена)',
  s: 'суперлативна',
}

export const adpositionTypeMap = {
  p: 'прост предлог',
}

export const adpositionFormMap = {
  s: 'прост',
  c: 'сложен',
}

export const conjunctionTypeMap = {
  c: 'координативен',
  s: 'субординативен',
}

export const conjunctionFormMap = {
  s: 'прост',
  c: 'сложен',
}

export const numeralFormMap = {
  d: 'арапска цифра',
  r: 'римска цифра',
  l: 'со букви',
}

export const particleFormMap = {
  s: 'проста честичка',
  c: 'сложена честичка',
}

export const residualTypeMap = {
  f: 'странски збор',
  t: 'типографска грешка',
  w: 'веб-локација',
  e: 'емоџи',
  h: 'хаштагови',
  a: '„@“ ознака',
  p: 'име на програма',
}

function addMappedValue(parts, map, key) {
  const value = map[key]

  if (value) {
    parts.push(value)
  }
}

export function decodeTag(tag) {
  if (
    typeof tag !== 'string'
    || !tag.trim()
  ) {
    return 'Нема морфолошка ознака.'
  }

  const letters = tag.trim().split('')
  const pos = letters[0]
  const parts = []

  addMappedValue(
    parts,
    posMap,
    pos,
  )

  switch (pos) {
    case 'N': {
      const [, type, gender, number] =
        letters

      addMappedValue(
        parts,
        nounTypeMap,
        type,
      )

      addMappedValue(
        parts,
        genderMap,
        gender,
      )

      addMappedValue(
        parts,
        numberMap,
        number,
      )

      break
    }

    case 'V': {
      const [
        ,
        type,
        aspect,
        ,
        tense,
        person,
        number,
        gender,
      ] = letters

      addMappedValue(
        parts,
        verbTypeMap,
        type,
      )

      addMappedValue(
        parts,
        aspectMap,
        aspect,
      )

      addMappedValue(
        parts,
        tenseMap,
        tense,
      )

      addMappedValue(
        parts,
        personMap,
        person,
      )

      addMappedValue(
        parts,
        numberMap,
        number,
      )

      addMappedValue(
        parts,
        genderMap,
        gender,
      )

      break
    }

    case 'A': {
      const [
        ,
        type,
        degree,
        gender,
        number,
      ] = letters

      addMappedValue(
        parts,
        adjectiveTypeMap,
        type,
      )

      addMappedValue(
        parts,
        adjectiveDegreeMap,
        degree,
      )

      addMappedValue(
        parts,
        genderMap,
        gender,
      )

      addMappedValue(
        parts,
        numberMap,
        number,
      )

      break
    }

    case 'P': {
      const [
        ,
        type,
        person,
        gender,
        number,
      ] = letters

      addMappedValue(
        parts,
        pronounTypeMap,
        type,
      )

      addMappedValue(
        parts,
        personMap,
        person,
      )

      addMappedValue(
        parts,
        genderMap,
        gender,
      )

      addMappedValue(
        parts,
        numberMap,
        number,
      )

      break
    }

    case 'R': {
      const [
        ,
        type,
        degree,
      ] = letters

      addMappedValue(
        parts,
        adverbTypeMap,
        type,
      )

      addMappedValue(
        parts,
        adverbDegreeMap,
        degree,
      )

      break
    }

    case 'S': {
      const [
        ,
        type,
        form,
      ] = letters

      addMappedValue(
        parts,
        adpositionTypeMap,
        type,
      )

      addMappedValue(
        parts,
        adpositionFormMap,
        form,
      )

      break
    }

    case 'C': {
      const [
        ,
        type,
        form,
      ] = letters

      addMappedValue(
        parts,
        conjunctionTypeMap,
        type,
      )

      addMappedValue(
        parts,
        conjunctionFormMap,
        form,
      )

      break
    }

    case 'M': {
      const [
        ,
        form,
        ,
        gender,
      ] = letters

      addMappedValue(
        parts,
        numeralFormMap,
        form,
      )

      addMappedValue(
        parts,
        genderMap,
        gender,
      )

      break
    }

    case 'Q': {
      const [
        ,
        form,
      ] = letters

      addMappedValue(
        parts,
        particleFormMap,
        form,
      )

      break
    }

    case 'X': {
      const [
        ,
        type,
      ] = letters

      addMappedValue(
        parts,
        residualTypeMap,
        type,
      )

      break
    }

    default:
      break
  }

  if (parts.length === 0) {
    return 'Непозната морфолошка ознака.'
  }

  return parts.join(', ')
}