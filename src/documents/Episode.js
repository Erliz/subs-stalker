export default class Episode {
  constructor({
    id = null,
    tvdbId,
    episodeNum,
    seriesPath,
    seasonNum = 1,
    releaseGroup = null,
    videoFileName = null,
    subtitleFileName = null,
    seriesTitle = null,
    }) {
    if (!tvdbId || !episodeNum || !seriesPath) {
      throw TypeError('To create Episode fields tvdbId, episodeNum, seriesPath should be set');
    }

    this.id = id;
    this.tvdbId = tvdbId;
    this.seasonNum = seasonNum;
    this.episodeNum = episodeNum.toString();
    this.releaseGroup = releaseGroup;
    this.videoFileName = videoFileName;
    this.seriesTitle = seriesTitle;
    this.seriesPath = seriesPath;
    this.subtitleFileName = subtitleFileName;
  }

  get subtitleFilePath() {
    return `${this.seriesPath.replace(/\/$/g, '')}/Season ${
      this.seasonNum}/${this.subtitleFileName}`;
  }
}
