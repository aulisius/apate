import React from "react";
import api from "api";
import { chunk } from "lodash";
import { Link } from "@reach/router";
export class BrowseVideos extends React.Component {
  state = {
    videos: []
  };
  fetchAllVideos = async () => {
    let videos = await api.get("/api/video/all");
    this.setState({
      videos: chunk(videos, 2)
    });
  };
  componentDidMount() {
    this.fetchAllVideos();
  }

  getVideoId = url => {
    let parsedUrl = new URL(url);
    return parsedUrl.searchParams.get("v");
  };

  sanitizeName = (name, url) => {
    let videoId = "-" + this.getVideoId(url);
    let extensions = [".webm", ".mp4"];

    return extensions.reduce(
      (url, ext) => url.replace(ext, ""),
      name.replace(videoId, "")
    );
  };

  render() {
    return (
      <div className="w-50 mx-auto">
        <div
          className="d-flex"
          style={{
            flexFlow: "column wrap"
          }}
        >
          {this.state.videos.map(videoChunk => (
            <div className="card-group" style={{ padding: "10px" }}>
              {videoChunk.map(_ => (
                <div className="card" key={_.url}>
                  <img
                    className="card-img-top"
                    alt={_.name}
                    src={`https://img.youtube.com/vi/${this.getVideoId(
                      _.url
                    )}/hqdefault.jpg`}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {this.sanitizeName(_.name, _.url)}
                    </h5>
                    <p className="card-text">
                      <Link
                        to={`/watch/${this.getVideoId(_.url)}`}
                        className="text-muted"
                      >
                        Watch now!
                      </Link>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
