/**
 * Static presentation demo for the home “two models” section.
 * No live generateDualOpinion / analyzeOpinions / LLM calls.
 */
export type TwoModelsView = 'confirmed' | 'differs';

export const TWO_MODELS_DEFAULT_VIEW: TwoModelsView = 'confirmed';

/** i18n key paths under home.twoModels — shaped like Opinion.summary / Opinion.reasoning. */
export const twoModelsDemoData = {
  confirmed: {
    bodyKey: 'home.twoModels.confirmed.body',
  },
  differs: {
    framingKey: 'home.twoModels.differs.body',
    columns: [
      {
        id: 'evidence',
        labelKey: 'home.twoModels.differs.evidenceBased',
        reasoningKey: 'home.twoModels.differs.evidenceReasoning',
      },
      {
        id: 'contextual',
        labelKey: 'home.twoModels.differs.contextual',
        reasoningKey: 'home.twoModels.differs.contextualReasoning',
      },
    ],
  },
} as const;
