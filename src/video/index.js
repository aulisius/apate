import api from "api";
import classnames from "classnames";
import { get, last, inRange } from "lodash";
import React, { Fragment } from "react";
import Popover from "react-popover";
import YouTubePlayer from "youtube-player";
import { Claim } from "../claim";
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
    captions: [],
    timelines: []
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
          this.captionRefs[activeIndex].scrollIntoView({
            behaviour: "smooth",
            alignToTop: false
          });
      }
    }
  };

  componentDidUpdate() {}

  scrollToCaption = async (caption, index) => {
    this.captionRefs[index].scrollIntoView({
      behaviour: "smooth",
      alignToTop: false
    });
    this.setState({
      activeIndex: index
    });
    await this.player.pauseVideo();
    await this.player.seekTo(Math.ceil(caption.startTime / 1000), true);
  };

  claimToBSMapping = {
    uncertain: "secondary",
    truth: "success",
    lie: "warning",
    hate_speech: "danger",
    exaggerated_promise: "info"
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
      "uncertain"
    );
    return {
      bsClass: this.claimToBSMapping[finalClaim],
      motion: finalClaim,
      text: this.motionMapping[finalClaim]
    };
  };

  motionMapping = {
    hate_speech: "Hate Speech",
    lie: "Lie",
    truth: "Truth",
    exaggerated_promise: "Exaggeration",
    uncertain: "Uncertain"
  };

  getDataPoints = captions => {
    let allCaptions = captions.length / 5;
    let markedCaptions = captions.filter(caption => caption.claims.length > 0);
    let none = allCaptions - markedCaptions.length;
    let totalClaims = allCaptions - markedCaptions.length;
    let stats = {
      uncertain: none
    };
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

  constructTimeline() {
    let totalTime = last(this.state.captions).endTime;
    return this.state.captions.forEach((caption, index) => {
      let scaledStartTime = (caption.startTime / totalTime) * 100;
      let scaledEndTime = (caption.endTime / totalTime) * 100;
      let percentageToPaint = scaledEndTime - scaledStartTime;
      this.setState({
        timelines: [
          ...this.state.timelines,
          {
            key: caption.startIndex + "" + index,
            percentageToPaint,
            color: this.getColorFromClaims(caption.claims).bsClass
          }
        ]
      });
    });
  }

  render() {
    return (
      <Fragment>
        <div className="mx-auto" style={{ width: "85%" }}>
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
                                    type: "pie",
                                    radius: "70%",
                                    indexLabel: "{name}: {y}",
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
                            initial={{ showReply: false, showClaims: false }}
                            render={(state, setState) => (
                              <div
                                ref={this.getCaptionsRef(index)}
                                className="container"
                                style={{
                                  padding: "10px"
                                }}
                              >
                                <Popover
                                  isOpen={state.showReply}
                                  tipSize={2}
                                  body={
                                    <Claim
                                      userName={this.props.userName}
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
                                  }
                                >
                                  <div className="row">
                                    <p
                                      onClick={async _ => {
                                        await this.scrollToCaption(
                                          caption,
                                          index
                                        );
                                        let claimDoesNotExist =
                                          caption.claims.filter(
                                            claim =>
                                              claim.claimCreatorUserName ===
                                              this.props.userName
                                          ).length === 0;
                                        if (
                                          claimDoesNotExist &&
                                          this.props.loggedIn
                                        ) {
                                          setState({
                                            showReply: !state.showReply
                                          });
                                        }
                                      }}
                                      title={
                                        this.props.loggedIn
                                          ? "Click to add your claim"
                                          : "Login to add your claim"
                                      }
                                      className="col-md-7 pr-0 claim-bucket"
                                      style={{
                                        fontWeight:
                                          index === this.state.activeIndex
                                            ? "bold"
                                            : "normal",
                                        fontSize:
                                          index === this.state.activeIndex
                                            ? "18px"
                                            : "16px"
                                      }}
                                    >
                                      {caption.text}
                                    </p>
                                    {!state.showReply &&
                                      index === this.state.activeIndex && (
                                        <div
                                          className="col-md-4"
                                          style={{
                                            display: "inline"
                                          }}
                                        >
                                          <Popover
                                            isOpen={state.showClaims}
                                            refreshIntervalMs={false}
                                            place="below"
                                            onOuterAction={_ =>
                                              setState({
                                                showClaims: false
                                              })
                                            }
                                            style={{
                                              width: "500px",
                                              height: "500px"
                                            }}
                                            body={
                                              <div
                                                style={{
                                                  display: "flex",
                                                  flex: "row wrap",
                                                  border: "1px solid",
                                                  padding: "10px"
                                                }}
                                              >
                                                {caption.claims.map(claim => (
                                                  <div
                                                    class="card"
                                                    key={claim.uuid}
                                                  >
                                                    <div class="card-body">
                                                      <h5 class="card-title">
                                                        {
                                                          this.motionMapping[
                                                            claim.motion
                                                          ]
                                                        }
                                                      </h5>
                                                      {/* <h6 class="card-subtitle mb-2 text-muted">
                                                        {
                                                          claim.claimCreatorUserName
                                                        }
                                                      </h6> */}
                                                      <p className="card-text">
                                                        {claim.comment}
                                                      </p>
                                                      {this.props.loggedIn && (
                                                        <div
                                                          class="btn-group"
                                                          role="group"
                                                          aria-label="Basic example"
                                                        >
                                                          <button
                                                            onClick={async () => {
                                                              await api.postBody(
                                                                "/api/claim/vote",
                                                                {
                                                                  url: `https://www.youtube.com/watch?v=${
                                                                    this.props
                                                                      .videoId
                                                                  }`,
                                                                  claimId:
                                                                    claim.uuid,
                                                                  vote: "upvote"
                                                                }
                                                              );
                                                              await this.fetchCaptions();
                                                            }}
                                                            className="btn btn-outline-success"
                                                          >
                                                            Support
                                                            <span className="px-2 badge badge-pill badge-light">
                                                              {
                                                                claim.upVoteCount
                                                              }
                                                            </span>
                                                          </button>
                                                          <button
                                                            onClick={async () => {
                                                              await api.postBody(
                                                                "/api/claim/vote",
                                                                {
                                                                  url: `https://www.youtube.com/watch?v=${
                                                                    this.props
                                                                      .videoId
                                                                  }`,
                                                                  claimId:
                                                                    claim.uuid,
                                                                  vote:
                                                                    "downvote"
                                                                }
                                                              );
                                                              await this.fetchCaptions();
                                                            }}
                                                            className="btn btn-outline-danger"
                                                          >
                                                            Refute
                                                            <span className="px-2 badge badge-pill badge-light">
                                                              {
                                                                claim.downVoteCount
                                                              }
                                                            </span>
                                                          </button>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            }
                                          >
                                            <div
                                              class="btn-group"
                                              role="group"
                                              aria-label="Basic example"
                                            >
                                              <button
                                                className={`btn btn-${
                                                  this.getColorFromClaims(
                                                    caption.claims
                                                  ).bsClass
                                                }`}
                                              >
                                                {
                                                  this.getColorFromClaims(
                                                    caption.claims
                                                  ).text
                                                }
                                              </button>
                                              <button
                                                type="button"
                                                onClick={_ => {
                                                  let show =
                                                    caption.claims.length > 0;
                                                  setState({
                                                    showClaims: show
                                                  });
                                                  if (show) {
                                                    this.player.pauseVideo();
                                                  }
                                                }}
                                                title="View claims"
                                                className={`btn btn-secondary`}
                                              >
                                                <span class="badge badge-secondary">
                                                  {caption.claims.length}
                                                </span>
                                                <i className="far fa-comments" />
                                              </button>
                                            </div>
                                          </Popover>
                                        </div>
                                      )}
                                  </div>
                                </Popover>
                              </div>
                            )}
                          />
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
                        style={{ backgroundColor: "white" }}
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
                            Transcript
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
                            Video analysis
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
        {/* {<div
          className="d-flex p-0 mx-auto"
          style={{
            width: "85%",
            borderRadius: "2px",
            border: "1px solid",
            height: "15px"
          }}
        >
          {this.state.timelines.map(options => {
            return (
              <div
                key={options.key}
                className={`bg-${options.color}`}
                style={{
                  width: `${options.percentageToPaint}%`
                }}
              />
            );
          })}
        </div>} */}
      </Fragment>
    );
  }
}
