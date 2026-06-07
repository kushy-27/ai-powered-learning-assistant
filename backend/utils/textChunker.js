export const chunkText = (text, chunkSize=500, overlap=50) => {
    if(!text || text.trim().length === 0){
        return [];
    }

    const cleanedText = text.replace(/\s+/g, ' ').trim();

    const paragraphs = cleanedText.split('. ').map(p => p.trim()).filter(p => p.length > 0);

    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/);
    const paragraphWordCount = words.length;

    if (paragraphWordCount > chunkSize) {
        if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join("\n\n"),
            chunkIndex: chunkIndex++,
            pageNumber: 0,
        });
        }

        currentChunk = [];
        currentWordCount = 0;

        for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunkWords = words.slice(i, i + chunkSize);

        chunks.push({
            content: chunkWords.join(" "),
            chunkIndex: chunkIndex++,
            pageNumber: 0,
        });

        if (i + chunkSize >= words.length) break;
        }

        continue;
    }

    if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
        chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
        });

        const prevChunkWords = currentChunk.join(" ").split(/\s+/);
        const overlapWords = prevChunkWords
        .slice(-Math.min(overlap, prevChunkWords.length))
        .join(" ");

        currentChunk = overlapWords ? [overlapWords, paragraph] : [paragraph];
        currentWordCount =
        (overlapWords ? overlapWords.split(/\s+/).length : 0) + paragraphWordCount;
    } else {
        currentChunk.push(paragraph);
        currentWordCount += paragraphWordCount;
    }
    }

    if (currentChunk.length > 0) {
    chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
    });
    }

    return chunks;
};

export const findRelevantChunks = (chunks, query, maxChunks = 5) => {
  if (!chunks || chunks.length === 0 || !query || query.trim().length === 0) {
    return [];
  }

  const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const stopWords = new Set([
    "the", "is", "at", "in", "and", "to", "of",
    "a", "that", "it", "with", "as", "for", "was",
    "on", "are", "by", "this", "be", "which", "or",
    "from", "but"
  ]);

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word && !stopWords.has(word));

  if (queryWords.length === 0) {
    return chunks.slice(0, maxChunks).map(chunk => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      id: chunk._id
    }));
  }

  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    for (const queryWord of queryWords) {
      const safeWord = escapeRegex(queryWord);

      const exactMatches =
        (content.match(new RegExp(`\\b${safeWord}\\b`, "g")) || []).length;

      score += exactMatches * 3;

      const partialMatches =
        (content.match(new RegExp(safeWord, "g")) || []).length;

      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    const uniqueWordsFound = queryWords.filter(qw =>
      content.includes(qw)
    ).length;

    if (uniqueWordsFound > 0) {
      score += uniqueWordsFound * 2;
    }

    const normalizedScore =
      contentWords > 0 ? score / Math.sqrt(contentWords) : 0;

    const positionBonus = Math.max(0, 1 - index / chunks.length);

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      id: chunk._id,
      score: normalizedScore + positionBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound
    };
  });

  return scoredChunks
    .filter(chunk => chunk.rawScore > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.matchedWords !== a.matchedWords) return b.matchedWords - a.matchedWords;
      return b.rawScore - a.rawScore;
    })
    .slice(0, maxChunks);
};