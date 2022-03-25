declare module "*.css" {
  const exp_type: {
    css: string;
    class: {
      [key: string]: string;
    };
  };
  export default exp_type;
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
