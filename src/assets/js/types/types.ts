"use strict"

// Edit the TypeScript file, not the compiled JavaScript file.

type _MetaData = {
  copyright?: string;
  title?: string | null;
  subtitle?: boolean;
  displayTitle?: boolean;
};

export const trueIfMissing: (keyof Pick<_MetaData, 'subtitle' | 'displayTitle'>)[] = ['subtitle', 'displayTitle'];


type _ParagraphsData = {
  details?: _DetailsData;
  paragraph?: _ParagraphData;
  paragraphs?: _ParagraphsData;
  subparagraphs?: _ParagraphsData;
};

type _ParagraphData = string;

type _DetailsData = string[];

export type GridData = {
  page: string;
  image?: string | URL;
};

export type ParagraphsList = (_ParagraphData | _ParagraphsData | _DetailsData)[];

export type YamlData = {
  meta?: _MetaData;
  iframe?: string | URL;
  paragraphs?: ParagraphsList;
  grid?: GridData[] | (string | URL)[];
};

export type ElementCallback = (
  data: YamlData,
  parent?: HTMLElement | null,
  sibling?: HTMLElement | null
) => HTMLElement;

export type AsyncElementCallback  = (
  data: YamlData,
  parent?: HTMLElement | null,
  sibling?: HTMLElement | null
) => Promise<HTMLElement>;