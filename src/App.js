import React, { Component } from 'react';
import moment from 'moment';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import axios from 'axios';
import upIcon from './icons/ic_thumb_up_black_24px.svg';
import downIcon from './icons/ic_thumb_down_black_24px.svg';
import clockIcon from './icons/ic_access_time_white_24px.svg';
import './App.css';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class JodelWall extends Component {
  state = {
    messages: [],
    username: '',
    usernameConfirmed: false,
    message: '',
    color: 0,
    userAmount: 0,
  };

  async componentDidMount() {
    this.getMessages();
    this.initWebSocket();
  }

  initWebSocket = () => {
    this.websocket = new WebSocket("ws://139.162.254.62/ws2");
    this.websocket.onmessage = this.handleMessage;
    this.websocket.onerror = this.handleError;
    this.websocket.onclose = this.handleOnClose;
  };

  getMessages = async () => {
    const { data } = await axios.get("http://139.162.254.62/jodel/api/messages");
    this.setState({ messages: data });
  };

  handleOnClose = () => {
    this.initWebSocket();
  };

  handleError = error => {
    console.log('error: ', error);
  };

  handleMessage = e => {
    const data = JSON.parse(e.data);
    if (data.type === 'jodel') {
      this.setState({ messages: [data, ...this.state.messages] });
    } else if (data.type === 'vote') {
      this.setState({
        messages: this.state.messages.map(m => {
          if (m.id === data.data.id) {
            return data.data;
          }
          return m;
        }),
      });
    } else if (data.type === 'userAmount') {
      this.setState({
        userAmount: data.amount,
      });
    }
  };

  sendMessage = e => {
    console.log(moment().format('DD.MM.YYYY HH:mm'));
    e.preventDefault();
    this.websocket.send(
      JSON.stringify({
        type: 'jodel',
        name: this.state.username,
        message: this.state.message,
        color: `rgb(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(
          255,
        )})`,
        time: moment().format('DD.MM.YYYY HH:mm'),
      }),
    );
    this.setState({ message: '' });
  };

  handleMessageChange = e => {
    this.setState({ message: e.target.value });
  };

  voteUp = id => {
    this.websocket.send(
      JSON.stringify({
        type: 'upvote',
        id,
      }),
    );
  };

  voteDown = id => {
    this.websocket.send(
      JSON.stringify({
        type: 'downvote',
        id,
      }),
    );
  };

  renderMessages = () => {
    return this.state.messages.map(message => {
      return (
        <div
          className="Message-wrapper"
          key={message.id}
          style={{ backgroundColor: message.color }}
          // onClick={() => this.props.history.push(`/post/${message.id}`)}
        >
          <div className="Block-wrapper">
            <div
              className="Message-block"
              style={{
                color: 'white',
              }}
            >
              <div className="Message-time">
                <img className="Clock-icon" src={clockIcon} alt="clock" />
                <span>{message.time}</span>
              </div>
              <div className="Message-content">{message.message}</div>
              {message.quoteText ? (
                <div className="Message-quote">
                  {`"${message.quoteText}"`} - {message.quoteAuthor}
                </div>
              ) : (
                <div className="Message-quote">Ei lainausta tällä kertaa.</div>
              )}
            </div>
            <div className="Message-vote">
              <img
                src={upIcon}
                alt="up"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.voteUp(message.id);
                }}
              />
              <div style={{ color: 'white', fontSize: '20px' }}>
                {message.votes}
              </div>
              <img
                src={downIcon}
                style={{
                  marginTop: '3px',
                }}
                alt="down"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.voteDown(message.id);
                }}
              />
            </div>
          </div>
        </div>
      );
    });
  };

  render() {
    const { userAmount } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Jodel ({userAmount})</h1>
        </header>
        <div className="Chat-window">
          <div id="chatwindow" className="Message-div">
            {this.renderMessages()}
          </div>
          <div className="Chat-input">
            <input
              className="Chat-inputfield"
              onChange={this.handleMessageChange}
              value={this.state.message}
              type="text"
            />
            <div className="Send-button" onClick={this.sendMessage}>
              Lähetä
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const Post = props => {
  return <div>Testi</div>;
};

const App = () => {
  return (
    <Router>
      <div style={{ height: '100%' }}>
        <Route exact path="/" component={JodelWall} />
        <Route exact path="/post/:id" component={Post} />
      </div>
    </Router>
  );
};

export default App;
