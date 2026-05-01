export function getNextLine(wordList, minChars = 38, maxChars = 44) {
  const words = []
  let len = 0
  for (let i = 0; i < 50; i++) {
    const word = wordList[Math.floor(Math.random() * wordList.length)]
    const proposed = len === 0 ? word.length : len + 1 + word.length
    if (proposed > maxChars) {
      if (len >= minChars) break
      continue
    }
    words.push(word)
    len = proposed
  }
  return words.join(' ') + ' '
}
