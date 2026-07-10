const STOP_WORDS = new Set([
  "the", "is", "at", "in", "and", "to", "of", "a", "an",
  "that", "it", "with", "as", "for", "was", "were", "on",
  "are", "by", "this", "be", "which", "or", "from", "but",
  "what", "when", "where", "who", "whom", "why", "how",
  "do", "does", "did", "can", "could", "should", "would"
]);


const normalizeWhitespace = (value = "") => {
  return value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")

    .replace(
      /([\p{L}\p{N}])-\s*\n\s*(?=[\p{L}\p{N}])/gu,
      "$1"
    )

    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const splitIntoSentences = (text) => {
  const paragraphs = normalizeWhitespace(text)
    .split(/\n\s*\n/)
    .map(paragraph =>
      paragraph
        .replace(/\s*\n\s*/g, " ")
        .trim()
    )
    .filter(Boolean);

  const segmenter =
    typeof Intl !== "undefined" &&
    typeof Intl.Segmenter === "function"
      ? new Intl.Segmenter(undefined, {
          granularity: "sentence"
        })
      : null;

  return paragraphs.flatMap(paragraph => {
    if (segmenter) {
      return Array.from(
        segmenter.segment(paragraph),
        part => part.segment.trim()
      ).filter(Boolean);
    }

    return (
      paragraph.match(
        /[^.!?]+(?:[.!?]+["'’”)}\]]*|$)/g
      ) || [paragraph]
    )
      .map(sentence => sentence.trim())
      .filter(Boolean);
  });
};

const tokenize = (value = "") => {
  const normalized = value
    .toLowerCase()
    .normalize("NFKC");

  return (
    normalized.match(
      /c\+\+|c#|[\p{L}\p{N}]+(?:[._-][\p{L}\p{N}]+)*/gu
    ) || []
  );
};

export const chunkText = (
  text,
  chunkSize = 500,
  overlap = 50
) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  if (
    !Number.isInteger(chunkSize) ||
    chunkSize <= 0
  ) {
    throw new Error(
      "chunkSize must be a positive integer"
    );
  }

  if (
    !Number.isInteger(overlap) ||
    overlap < 0 ||
    overlap >= chunkSize
  ) {
    throw new Error(
      "overlap must be an integer from 0 to chunkSize - 1"
    );
  }

  const units = splitIntoSentences(text);
  const chunks = [];

  let currentWords = [];

  let freshWordCount = 0;

  const pushCurrentChunk = (
    carryOverlap = true
  ) => {
    if (
      currentWords.length === 0 ||
      freshWordCount === 0
    ) {
      return;
    }

    const completedWords = [...currentWords];

    chunks.push({
      content: completedWords.join(" "),
      chunkIndex: chunks.length,
      pageNumber: 0
    });

    const carryCount = carryOverlap
      ? Math.min(
          overlap,
          completedWords.length
        )
      : 0;

    currentWords =
      carryCount > 0
        ? completedWords.slice(-carryCount)
        : [];

    freshWordCount = 0;
  };

  for (const unit of units) {
    const unitWords = unit
      .split(/\s+/)
      .filter(Boolean);

    if (unitWords.length === 0) {
      continue;
    }

    if (unitWords.length <= chunkSize) {
      if (
        currentWords.length +
          unitWords.length >
        chunkSize
      ) {
        pushCurrentChunk(true);

        const maxCarry = Math.max(
          0,
          chunkSize - unitWords.length
        );

        if (
          currentWords.length > maxCarry
        ) {
          currentWords =
            maxCarry > 0
              ? currentWords.slice(-maxCarry)
              : [];
        }
      }

      currentWords.push(...unitWords);
      freshWordCount += unitWords.length;
      continue;
    }

    let offset = 0;

    while (offset < unitWords.length) {
      if (
        currentWords.length === chunkSize
      ) {
        pushCurrentChunk(true);
      }

      const available =
        chunkSize - currentWords.length;

      const take = Math.min(
        available,
        unitWords.length - offset
      );

      currentWords.push(
        ...unitWords.slice(
          offset,
          offset + take
        )
      );

      freshWordCount += take;
      offset += take;

      if (
        currentWords.length === chunkSize
      ) {
        pushCurrentChunk(true);
      }
    }
  }

  pushCurrentChunk(false);

  return chunks;
};

export const findRelevantChunks = (
  chunks,
  query,
  maxChunks = 5
) => {
  if (
    !Array.isArray(chunks) ||
    chunks.length === 0 ||
    !query ||
    query.trim().length === 0
  ) {
    return [];
  }

  const limit =
    Number.isInteger(maxChunks)
      ? Math.max(0, maxChunks)
      : 5;

  if (limit === 0) {
    return [];
  }

 
  const queryWords = [
    ...new Set(
      tokenize(query).filter(
        word => !STOP_WORDS.has(word)
      )
    )
  ];

  if (queryWords.length === 0) {
    return chunks
      .slice(0, limit)
      .map(chunk => ({
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        id: chunk._id
      }));
  }

  const documents = chunks.map(chunk => {
    const tokens = tokenize(
      chunk.content || ""
    );

    const frequencies = new Map();

    for (const token of tokens) {
      frequencies.set(
        token,
        (frequencies.get(token) || 0) + 1
      );
    }

    return {
      tokens,
      frequencies
    };
  });

  const totalDocuments = documents.length;

  const totalDocumentLength =
    documents.reduce(
      (sum, document) =>
        sum + document.tokens.length,
      0
    );

  const averageDocumentLength =
    totalDocumentLength /
      totalDocuments || 1;

  const documentFrequency = new Map();

  for (const queryWord of queryWords) {
    let count = 0;

    for (const document of documents) {
      if (
        document.frequencies.has(queryWord)
      ) {
        count += 1;
      }
    }

    documentFrequency.set(
      queryWord,
      count
    );
  }

  const normalizedQuery =
    tokenize(query).join(" ");

  const k1 = 1.5;
  const b = 0.75;

  const scoredChunks = chunks.map(
    (chunk, index) => {
      const {
        tokens,
        frequencies
      } = documents[index];

      const documentLength =
        tokens.length || 1;

      const tokenSet = new Set(tokens);

      let rawScore = 0;
      let matchedWords = 0;

      for (
        const queryWord of queryWords
      ) {
        const df =
          documentFrequency.get(
            queryWord
          ) || 0;

        const idf = Math.log(
          1 +
            (
              totalDocuments -
              df +
              0.5
            ) /
              (df + 0.5)
        );

        const exactFrequency =
          frequencies.get(queryWord) || 0;

        if (exactFrequency > 0) {
          matchedWords += 1;

          const denominator =
            exactFrequency +
            k1 *
              (
                1 -
                b +
                b *
                  (
                    documentLength /
                    averageDocumentLength
                  )
              );

          rawScore +=
            idf *
            (
              exactFrequency *
              (k1 + 1)
            ) /
            denominator;

          continue;
        }

        if (queryWord.length >= 4) {
          let relatedCount = 0;

          for (const token of tokens) {
            if (
              token.length >= 4 &&
              (
                token.startsWith(
                  queryWord
                ) ||
                queryWord.startsWith(
                  token
                )
              )
            ) {
              relatedCount += 1;
            }
          }

          if (relatedCount > 0) {
            matchedWords += 1;

            rawScore +=
              idf *
              Math.min(
                1,
                relatedCount * 0.35
              );
          }
        }
      }

      const coverage =
        matchedWords /
        queryWords.length;

      rawScore += coverage * 2;

      const normalizedContent =
        tokens.join(" ");

      if (
        normalizedQuery.length >= 4 &&
        normalizedContent.includes(
          normalizedQuery
        )
      ) {
        rawScore += 3;
      }

      const allImportantTermsPresent =
        queryWords.every(word => {
          if (tokenSet.has(word)) {
            return true;
          }

          if (word.length < 4) {
            return false;
          }

          return tokens.some(
            token =>
              token.length >= 4 &&
              (
                token.startsWith(word) ||
                word.startsWith(token)
              )
          );
        });

      if (allImportantTermsPresent) {
        rawScore += 1.5;
      }

      const positionBonus =
        totalDocuments > 1
          ? 0.15 *
            (
              1 -
              index /
                (totalDocuments - 1)
            )
          : 0.15;

      return {
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        id: chunk._id,
        score:
          rawScore + positionBonus,
        rawScore,
        matchedWords
      };
    }
  );

  return scoredChunks
    .filter(
      chunk =>
        chunk.rawScore > 0 &&
        chunk.matchedWords > 0
    )
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (
        b.matchedWords !==
        a.matchedWords
      ) {
        return (
          b.matchedWords -
          a.matchedWords
        );
      }

      if (
        b.rawScore !== a.rawScore
      ) {
        return (
          b.rawScore -
          a.rawScore
        );
      }

      return (
        a.chunkIndex -
        b.chunkIndex
      );
    })
    .slice(0, limit);
};
