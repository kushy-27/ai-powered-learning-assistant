import Flashcard from "../models/Flashcard.js";

export const getFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user.id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFlashcardSets = async (req, res, next) => {
  try {
    const flashcardSets = await Flashcard.find({
      userId: req.user.id,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user.id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set or card not found",
        statusCode: 404,
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);

    if(cardIndex===-1){
      return res.status(404).json({
        success: false,
        error: 'Card not found in set',
        statusCode: 404
      });
    }

    flashcardSet.cards[cardIndex].lastReviewed=new Date();
    flashcardSet.cards[cardIndex].reviewCount+=1;

    flashcardSet.markModified("cards");

    await flashcardSet.save();
    return res.status(200).json({
      success: true,
      data: flashcardSet,
      message: "Flashcard reviewed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user.id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set or card not found",
        statusCode: 404,
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      card => card._id.toString() === req.params.cardId
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Card not found in set",
        statusCode: 404,
      });
    }

    flashcardSet.cards[cardIndex].isStarred =
      !flashcardSet.cards[cardIndex].isStarred;

    flashcardSet.markModified("cards");
    await flashcardSet.save();

    return res.status(200).json({
      success: true,
      data: flashcardSet.cards[cardIndex],
      message: "Flashcard status updated",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
        statusCode: 404,
      });
    }

    await flashcardSet.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Flashcard set deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};