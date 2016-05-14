import React from 'react';
import ReactDOM from 'react-dom';

const Alert = ({
  status,
  text
}) => (
  <div className={`alert alert-dismissible alert-${status}`} role="alert">
    <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span
      aria-hidden="true">&times;</span></button>
      {text}
  </div>
);

const AlertsList = ({
  alerts
}) => (
  <div>
    {alerts.map(item => <Alert key={item.text} {...item} />)}
  </div>
);

const Episode = React.createClass({
  render() {
    //noinspection CheckTagEmptyBody
    return (
      <tr>
        <td>
          {this.props.data.id}
        </td>
        <td>
          {this.props.data.releaseGroup}
        </td>
        <td>
          {this.props.data.seriesTitle}
        </td>
        <td>
          {this.props.data.seasonNum}
        </td>
        <td>
          {this.props.data.episodeNum}
        </td>
        <td>
          <span onClick={() => {this.props.onRemove(this.props.data.id)}}
                className="glyphicon glyphicon-remove-circle"></span>
        </td>
      </tr>
    );
  }
});

const EpisodesList = React.createClass({
  render() {
    let list = this.props.data.map((item) => {
      return <Episode key={item.id} onRemove={this.props.onEpisodeRemove} data={item}/>
    });

    return (
      <table className="table table-inverse">
        <thead>
        <tr>
          <td>
            #
          </td>
          <td>
            Release Group
          </td>
          <td>
            Title
          </td>
          <td>
            Season
          </td>
          <td>
            Episode
          </td>
          <td>
          </td>
        </tr>
        </thead>
        <tbody>
          {list}
        </tbody>
      </table>
    );
  }
});

const App = React.createClass({
  getInitialState() {
    return {alerts: []};
  },

  onEpisodeRemove(id) {
    let self = this;
    $.ajax(`/remove/${id}/`)
      .success((response) => {
        self.addAlert(
          `Removed ${response.seriesTitle} S${response.seasonNum}E${response.episodeNum}`,
          `success`
        );
        updateJSON();
      })
      .fail((response) => {
        self.addAlert(
          `Fail to remove ${response.seriesTitle} S${response.seasonNum}E${response.episodeNum}`,
          `danger`
        )
      });
  },

  addAlert(text, status) {
    this.setState((prev) => {
      prev.alerts.push({text, status});
      return {
        alerts: prev.alerts
      }
    })
  },

  render() {
    let content = <h4>No wanted episodes</h4>;
    if (this.props.data.length) {
      content = <EpisodesList onEpisodeRemove={this.onEpisodeRemove} data={this.props.data}/>
    }
    let style = {textAlign: 'center'};
    return (
      <div>
        <div className="row">
          <h2 style={style}>WANTED</h2>
          {content}
        </div>
        <AlertsList alerts={this.state.alerts}/>
      </div>
    );
  }
});

function updateJSON() {
  $.getJSON('/list/', function (json) {
    console.log('json update');
    ReactDOM.render(
      <App data={json}/>,
      document.getElementById('app')
    );
  });
}

function init() {
  updateJSON();
  setTimeout(init, 60000);
}

init();
