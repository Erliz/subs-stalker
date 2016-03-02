export default class Episode {
  constructor({
    tvdbId,
    episodeNum,
    seriesPath,
    seasonNum = 1,
    episodePath = null,
    releaseGroup = null,
    videoFileName = null,
    subtitleFileName = null,
    seriesTitle = null,
    }) {
    if (!tvdbId || !episodeNum || !seriesPath) {
      throw TypeError('To create Episode fields tvdbId, episodeNum, seriesPath should be set');
    }

    this.tvdbId = tvdbId;
    this.seasonNum = seasonNum;
    this.episodeNum = episodeNum;
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
