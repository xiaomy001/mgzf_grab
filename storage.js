const fs = require('fs');

module.exports = class storage {
  constructor(type) {
    this.dataFilePath = `/tmp/mgzf_data/mgzf_${type}_data`;
    this.requestErrorFilePath = `/tmp/mgzf_request_error/mgzf_${type}_request_error`;
    this.logFilePath = `/tmp/mgzf_log/mgzf_${type}.log`;
    this.dataFd = undefined;
    this.requestErrorFd = undefined;
    this.logFd = undefined;
  }

  closeAllFds() {
    this.closeDataFd();
    this.closeRequestErrorFd();
    this.closeLogFd();
  }

  getDataFd() {
    if (!this.dataFd) {
      this.dataFd = fs.openSync(this.dataFilePath, 'a');
    }

    return this.dataFd;
  }

  closeDataFd() {
    if (this.dataFd) {
      fs.closeSync(this.dataFd);
    }
  }

  getRequestErrorFd() {
    if (!this.requestErrorFd) {
      this.requestErrorFd = fs.openSync(this.requestErrorFilePath, 'a');
    }

    return this.requestErrorFd;
  }

  closeRequestErrorFd() {
    if (this.requestErrorFd) {
      fs.closeSync(this.requestErrorFd);
    }
  }

  getLogFd() {
    if (!this.logFd) {
      this.logFd = fs.openSync(this.logFilePath, 'a');
    }

    return this.logFd;
  }

  closeLogFd() {
    if (this.logFd) {
      fs.closeSync(this.logFd);
    }
  }

};
