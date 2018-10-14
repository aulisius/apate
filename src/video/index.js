import api from "api";
import classnames from "classnames";
import { get, inRange } from "lodash";
import React, { Fragment } from "react";
import YouTubePlayer from "youtube-player";
import { Claim } from "../claim";
import { colors } from "../color";
import { State } from "../state";
import TabSwitcher from "../tab-switcher";
import { CanvasJSChart } from "./canvasjs.react";

let PlayerStates = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  VIDEO_CUED: 5
};

export class Video extends React.Component {
  player = null;

  state = {
    activeIndex: 0,
    captions: []
  };

  callbackid = null;

  fetchCaptions = async () => {
    let { annotations } = await api.get("/api/video", {
      url: `https://www.youtube.com/watch?v=${this.props.videoId}`
    });
    this.setState({
      captions: annotations.filter(caption => caption.text.trim().length > 0)
    });
  };

  componentDidMount() {
    this.player = YouTubePlayer("youtube-player", {
      videoId: this.props.videoId
    });

    this.player.on("stateChange", event => {
      switch (event.data) {
        case PlayerStates.PLAYING:
          this.callbackid = setInterval(this.trackCaptions, 1000);
          console.warn("video started");
          break;
        case PlayerStates.PAUSED:
        case PlayerStates.ENDED:
          console.warn(this.callbackid);
          clearInterval(this.callbackid);
          console.warn("load subtitles now");
          break;
        default:
          break;
      }
    });

    this.fetchCaptions().then(() => this.player.playVideo());
  }

  getCaptionSectionRef = ref => {
    this.captionSectionRef = ref;
    // const rect = this.captionsRef.getBoundingClientRect();
    // setTimeout(() => {
    //   this.captionsRef.scrollTo(rect.left, rect.bottom);
    // }, 4000);
  };

  captionRefs = [];

  getCaptionsRef = index => ref => {
    this.captionRefs[index] = ref;
  };

  trackCaptions = async () => {
    if (!this.player) {
      clearInterval(this.callbackid);
      return;
    }
    let status = await this.player.getPlayerState();
    if (status === PlayerStates.ENDED || status === PlayerStates.PAUSED) {
      clearInterval(this.callbackid);
      return;
    }
    let timesElapsed = await this.player.getCurrentTime();
    timesElapsed = timesElapsed * 1000;
    let activeIndex = this.state.captions.findIndex(caption =>
      inRange(timesElapsed, caption.startTime, caption.endTime)
    );
    let captionToBeHighlighted = this.state.captions.find(caption =>
      inRange(timesElapsed, caption.startTime, caption.endTime)
    );
    if (captionToBeHighlighted) {
      this.setState({
        activeIndex
      });
      if (activeIndex > 0) {
        this.captionRefs[activeIndex] &&
          this.captionRefs[activeIndex].scrollIntoView(true);
      }
    }
  };

  componentDidUpdate() {}

  scrollToCaption = (caption, index) => async () => {
    this.captionRefs[index].scrollIntoView(true);
    this.setState({
      activeIndex: index
    });
    // await this.player.pauseVideo();
    await this.player.seekTo(Math.ceil(caption.startTime / 1000), true);
  };

  getColorFromClaims = (claims = []) => {
    let stats = {};
    claims.forEach(claim => {
      stats[claim.motion] = claim.upVoteCount * 2 - claim.downVoteCount * 1;
    });
    let scores = Object.values(stats);
    let finalClaim = get(
      Object.entries(stats).find(([_, score]) => score === Math.max(...scores)),
      ["0"],
      "none"
    );
    return get(colors, [finalClaim, "backgroundColor"], "black");
    //   {
    //     "claimCreatorUserName": "t@g.com",
    //     "comment": "Test",
    //     "downVoteCount": 0,
    //     "motion": "truth",
    //     "upVoteCount": 1,
    //     "uuid": "b06832a8-cf30-11e8-b67d-9061ae80ca54"
    // }
  };

  motionMapping = {
    hate_speech: "Hate Speech",
    lie: "Lie",
    truth: "Truth",
    exaggerated_promise: "Exaggerated Promise",
    uncertain: "Uncertain"
  };

  getDataPoints = captions => {
    let allCaptions = captions.length;
    let markedCaptions = captions.filter(caption => caption.claims.length > 0);
    // let none = ((allCaptions - markedCaptions.length) / allCaptions) * 10;
    let totalClaims = 0;
    let stats = {};
    markedCaptions.map(caption => caption.claims).forEach(claims => {
      totalClaims += claims.length;
      claims.forEach(claim => {
        stats[claim.motion] = get(stats, [claim.motion], 0) + 1;
      });
    });
    return Object.entries(stats).map(([motion, times]) => ({
      name: this.motionMapping[motion],
      y: (times / totalClaims) * 100
    }));
  };

  render() {
    return (
      <Fragment>
        <div className="mx-auto w-75">
          <div className="row">
            <div className="col-md-6" id="youtube-player" />
            <section
              className="col-md-6"
              style={{
                height: "360px",
                overflowY: "scroll"
              }}
            >
              <TabSwitcher
                initialValue="captions"
                render={({ selectedTab, onTabSwitch }) => {
                  let tabContent;
                  switch (selectedTab) {
                    case "stats": {
                      tabContent =
                        this.state.captions.length > 0 ? (
                          <div
                            style={{
                              height: "300px"
                            }}
                          >
                            <CanvasJSChart
                              options={{
                                animationEnabled: true,
                                data: [
                                  {
                                    type: "doughnut",
                                    radius: "70%",
                                    innerRadius: "60%",
                                    indexLabel: "{name}",
                                    yValueFormatString: "#,###'%'",
                                    dataPoints: this.getDataPoints(
                                      this.state.captions
                                    )
                                  }
                                ]
                              }}
                            />
                          </div>
                        ) : null;
                      break;
                    }
                    case "captions":
                      tabContent = this.state.captions.map((caption, index) => (
                        <Fragment key={caption.startIndex + "" + index}>
                          <State
                            initial={{ showReply: false }}
                            render={(state, setState) => (
                              <div
                                ref={this.getCaptionsRef(index)}
                                className="container"
                                style={{
                                  cursor: "pointer",
                                  padding: "10px"
                                }}
                              >
                                <div
                                  className="row"
                                  onClick={this.scrollToCaption(caption, index)}
                                >
                                  <i
                                    className="far fa-arrow-alt-circle-right play-marker col-md-1"
                                    style={{ paddingRight: "5px" }}
                                  />
                                  <span
                                    className="col"
                                    style={{
                                      color: this.getColorFromClaims(
                                        caption.claims
                                      ),
                                      fontWeight:
                                        index === this.state.activeIndex
                                          ? "bold"
                                          : "normal"
                                    }}
                                  >
                                    {caption.text}
                                  </span>
                                  {!state.showReply && (
                                    <div
                                      className="col-md-3"
                                      style={{
                                        display: "inline"
                                      }}
                                    >
                                      <div
                                        class="btn-group"
                                        role="group"
                                        aria-label="Basic example"
                                      >
                                        <button
                                          type="button"
                                          title="View claims"
                                          class="btn btn-secondary"
                                        >
                                          <span class="badge badge-secondary">
                                            {caption.claims.length}
                                          </span>
                                          <i className="far fa-comments" />
                                        </button>
                                        {caption.claims.filter(
                                          claim =>
                                            claim.claimCreatorUserName ===
                                            "t@g.com"
                                        ).length === 0 && (
                                          <button
                                            type="button"
                                            title="Add Claim"
                                            onClick={async _ => {
                                              await this.player.pauseVideo();

                                              this.captionRefs[
                                                index
                                              ].scrollIntoView(true);
                                              this.setState({
                                                activeIndex: index
                                              });
                                              await this.player.seekTo(
                                                Math.ceil(
                                                  caption.startTime / 1000
                                                ),
                                                true
                                              );
                                              setState({
                                                showReply: !state.showReply
                                              });
                                            }}
                                            class="btn btn-secondary"
                                          >
                                            <i className="fas fa-user-plus" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {state.showReply && (
                                  <div className="container d-inline">
                                    <Claim
                                      videoId={this.props.videoId}
                                      caption={caption}
                                      closeClaim={(reload = false) => {
                                        setState({
                                          showReply: false
                                        });
                                        if (reload) {
                                          this.fetchCaptions();
                                        }
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          />
                          <br />
                        </Fragment>
                      ));
                      break;
                    default:
                      tabContent = null;
                  }
                  return (
                    <Fragment>
                      <ul
                        className="nav nav-tabs"
                        style={{
                          position: "sticky"
                        }}
                      >
                        <li class="nav-item">
                          <a
                            style={{ cursor: "pointer" }}
                            class={classnames("nav-link", {
                              active: selectedTab === "captions"
                            })}
                            onClick={_ => {
                              onTabSwitch("captions");
                              this.player.playVideo();
                            }}
                          >
                            Captions
                          </a>
                        </li>
                        <li class="nav-item">
                          <a
                            style={{ cursor: "pointer" }}
                            class={classnames("nav-link", {
                              active: selectedTab === "stats"
                            })}
                            onClick={_ => {
                              onTabSwitch("stats");
                              this.player.pauseVideo();
                            }}
                          >
                            Stats
                          </a>
                        </li>
                      </ul>
                      <div
                        className="tab-content"
                        ref={this.getCaptionSectionRef}
                      >
                        {tabContent}
                      </div>
                    </Fragment>
                  );
                }}
              />
            </section>
          </div>
        </div>
        <div
          className="d-flex p-0 w-75 mx-auto"
          style={{ borderRadius: "2px", border: "1px solid", height: "15px" }}
        >
          <span style={{ width: "60%", backgroundColor: "#701516" }} />
          <span style={{ width: "40%", backgroundColor: "#555555" }} />
        </div>
      </Fragment>
    );
  }
}
