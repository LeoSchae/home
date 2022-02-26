declare module "*.css" {
  const content: string;
  export default content;
}

declare type EleventyPage = {
  date: Date;
  inputPath: string;
  fileSlug: string;
  filePathStem: string;
  outputFileExtension: string;
  url: string;
  outputPath: string;
};

declare type EleventyThis = {
  ctx: {
    page: EleventyPage;
    collections: {
      all: EleventyPage[];
      [key: string]: EleventyPage[] | undefined;
    };
  };
  [key: string]: unknown;
};
