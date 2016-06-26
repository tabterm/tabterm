# ![>_](https://raw.githubusercontent.com/dbkaplun/tabterm/master/assets/logo_white_on_black.png) tabterm

What if your browser's new tab page was a terminal?

![screencast](assets/screencast.gif)

## Installation
```sh
$ npm install -g tabterm
```

## Usage
```sh
$ tabterm
TabTermServer started: http://127.0.0.1:7473
```

### New tab page

#### Chrome

* Install [New Tab Redirect](https://chrome.google.com/webstore/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna?hl=en)
* Open `chrome-extension://icpgjfneehieebagbmdbhnlpiopdcmna/options.html`
* Set the Redirect URL to `http://localhost:7473`
* Make sure "Always update tab, not redirect. (Enable for cursor in the address bar)" is checked
* Observe your new tab page is now a terminal
