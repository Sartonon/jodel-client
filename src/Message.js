import React, { Component } from 'react';
import './App.css';
import upIcon from './icons/ic_thumb_up_black_24px.svg';
import downIcon from './icons/ic_thumb_down_black_24px.svg';
import clockIcon from './icons/ic_access_time_white_24px.svg';

class Message extends Component {
  render() {
    const { message } = this.props;

    return (
      <div
        className="Message-wrapper"
        key={message.id}
        style={{ backgroundColor: message.color }}
        onClick={this.props.handleClick}
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
                this.props.voteUp(message.id);
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
                this.props.voteDown(message.id);
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Message;