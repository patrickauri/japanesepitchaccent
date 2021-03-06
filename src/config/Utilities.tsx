enum PitchType {
  Heiban,
  Atamadaka,
  Nakadaka,
  Odaka,
  NONE,
}

enum WordType {
  Noun,
  Verb,
  Adj,
  OTHER,
}

interface Result {
  word: string
  pitchNumber: number
  reading: string
  pitchType: PitchType
  mora: number
  wordType: WordType
}

export const IsSmallKana = (k: string) => {
  const smallKana = [
    "ゃ",
    "ゅ",
    "ょ",
    "ぁ",
    "ぃ",
    "ぅ",
    "ぇ",
    "ぉ",
    "ャ",
    "ュ",
    "ョ",
    "ァ",
    "ィ",
    "ゥ",
    "ェ",
    "ォ",
  ]

  let found = false
  smallKana.forEach((e) => {
    if (e === k) found = true
  })
  return found
}

export const ParseNHK = (data: any) => {
  const dWord: string = data["Word 1A"]
  let dPitch: string = data["Pitch 1.1"]
  let dMora = 0

  let result: Result = {
    word: "empty",
    pitchNumber: -1,
    reading: "no reading",
    pitchType: PitchType.NONE,
    mora: 0,
    wordType: WordType.OTHER,
  }

  const ParseNHKWord = () => {
    const locStart = dWord.indexOf("【") + 1
    const locEnd = dWord.indexOf("】")
    result.word = dWord.substring(locStart, locEnd)
  }

  const ParseNHKPitchNumber = () => {
    if (dPitch) {
      if (dPitch.includes("・")) {
        dPitch = dPitch.replace("・", "")
      }
      let a: string[] = []
      if (dPitch.indexOf("￣") === -1) {
        // Kifukushiki
        a = dPitch.split("")
        let dropFound = false
        a.forEach((e, i) => {
          if (e.charCodeAt(0) === 12442) {
            a.splice(i, 1)
          }
          if (e === "＼") {
            if (!dropFound) {
              result.pitchNumber = i
              dropFound = true
            }
          }
        })
      } else {
        // Heibanshiki
        result.pitchNumber = 0
      }
      result.reading = a.toString()
    }
  }

  const ParseNHKReading = () => {
    const readingKana = dWord.substring(0, dWord.indexOf("【"))
    result.reading = readingKana
  }

  const ParseNHKMora = () => {
    for (let index = 0; index < result.reading.length; index++) {
      const m = result.reading[index]
      if (!IsSmallKana(m)) {
        dMora++
      }
    }
    result.mora = dMora
  }

  const ParseNHKPitchType = () => {
    if (result.pitchNumber === 0) {
      result.pitchType = PitchType.Heiban
      return
    }
    if (result.pitchNumber === 1) {
      result.pitchType = PitchType.Atamadaka
      return
    }
    if (result.pitchNumber < dMora) {
      result.pitchType = PitchType.Nakadaka
      return
    } else {
      result.pitchType = PitchType.Odaka
      return
    }
  }

  const ParseNHKWordType = () => {
    if (data["Verb 1.1"] !== undefined) {
      result.wordType = WordType.Verb
    }
    if (data["Adj 1.1"] !== undefined) {
      result.wordType = WordType.Adj
    }
  }

  ParseNHKWord()
  ParseNHKPitchNumber()
  ParseNHKReading()
  ParseNHKMora()
  ParseNHKPitchType()
  ParseNHKWordType()

  return result
}

export const GetPitchTypeName = (n: PitchType) => {
  switch (n) {
    case PitchType.Heiban:
      return "Heiban（平板）"
    case PitchType.Atamadaka:
      return "Atamadaka（頭高）"
    case PitchType.Nakadaka:
      return "Nakadaka（中高）"
    case PitchType.Odaka:
      return "Odaka（尾高）"
    default:
      return "ERROR"
  }
}
