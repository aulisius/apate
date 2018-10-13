import React, { Fragment } from "react";
import YouTubePlayer from "youtube-player";
import { get, inRange } from "lodash";
import { State } from "../state";
let PlayerStates = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  VIDEO_CUED: 5
};

let captions = [
  {
    startTime: 0,
    endTime: 6000,
    startIndex: 0,
    endIndex: 203,
    text: `Dolor delectus aut doloribus reiciendis. Est error asperiores eos unde quidem sequi quidem doloremque. Vel dolorum magni dignissimos enim ut tempora. Magni ex vitae accusamus dignissimos eos distinctio.`
  },
  {
    startTime: 6000,
    endTime: 18000,
    startIndex: 203,
    endIndex: 410,
    text: `Vel quisquam harum tempora omnis ipsam dolor quod. Quas
    aliquid aperiam corrupti quia ea incidunt. Quod in nobis voluptatem
    quia ut. Ratione ut maxime natus nam nihil facere mollitia
    reiciendis.`
  },
  {
    startTime: 18000,
    endTime: 30000,
    startIndex: 411,
    endIndex: 755,
    text: `Deserunt accusamus laboriosam cum consequatur quasi vero
    id. Quae et non quia alias eum at. Excepturi nostrum blanditiis
    dolores iste eum eum. Cum impedit ducimus libero quasi. Cum quia
    quia quia amet asperiores deserunt nihil. Illum qui voluptatum fugit
    expedita. Aut dolorem atque sunt maxime nulla placeat officia
    maxime.`
  }
  //   `Perferendis sint provident dolor. Fuga nostrum facilis ex
  //     eos velit exercitationem. Quam quidem aut dolor nihil ut occaecati.
  //     Natus ut nisi dolores dolorem iste. Dolorem earum recusandae aut
  //     doloribus. Consequatur velit voluptatum voluptatem rem architecto.
  //     Aut id qui nesciunt dolores sint minus sit.`,
  //   `Modi odit fugiat facere.
  //     Minus ut odit sapiente expedita. Autem iste exercitationem maiores
  //     aut assumenda ipsum. Et ea numquam magni.`
];

export class Video extends React.Component {
  player = null;

  state = {
    activeIndex: 0,
    captions: []
  };

  callbackid = null;

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
          console.warn(this.callbackid);
          clearInterval(this.callbackid);
          console.warn("load subtitles now");
          break;
        default:
          break;
      }
    });

    this.player.playVideo().then(() => {
      this.setState({
        captions
      });
    });
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
    let status = await this.player.getPlayerState();
    console.warn(status);
    if (status === PlayerStates.ENDED || status === PlayerStates.PAUSED) {
      clearInterval(this.callbackid);
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

  render() {
    return (
      <div className="mx-auto w-75">
        <div className="row">
          <div className="col-md-6" id="youtube-player" />
          {this.state.captions.length > 0 && (
            <section
              className="col-md-6"
              ref={this.getCaptionSectionRef}
              style={{
                height: "360px",
                overflowY: "scroll"
              }}
            >
              {this.state.captions.map((caption, index) => (
                <Fragment key={index}>
                  <p
                    ref={this.getCaptionsRef(index)}
                    style={{
                      cursor: "pointer",
                      padding: "10px",
                      fontWeight:
                        index === this.state.activeIndex ? "bold" : "normal"
                    }}
                  >
                    <div onClick={this.scrollToCaption(caption, index)}>
                      <i
                        className="far fa-arrow-alt-circle-right play-marker"
                        style={{ paddingRight: "5px" }}
                      />
                      <div
                        style={{
                          display: "inline"
                        }}
                      >
                        {caption.text}
                      </div>
                    </div>
                    <State
                      initial={{ showReply: false }}
                      render={(state, setState) => {
                        return (
                          <Fragment>
                            <i
                              class="fas fa-reply"
                              onClick={async _ => {
                                await this.player.pauseVideo();

                                this.captionRefs[index].scrollIntoView(true);
                                this.setState({
                                  activeIndex: index
                                });
                                // await this.player.pauseVideo();
                                await this.player.seekTo(
                                  Math.ceil(caption.startTime / 1000),
                                  true
                                );
                                setState({
                                  showReply: !state.showReply
                                });
                              }}
                            />
                            {state.showReply && "message"}
                          </Fragment>
                        );
                      }}
                    />
                  </p>
                  <br />
                </Fragment>
              ))}
            </section>
          )}
        </div>
        <div className="row">
          <div className="col-md-10 md-push-2">Other videos</div>
        </div>
      </div>
    );
  }
}
