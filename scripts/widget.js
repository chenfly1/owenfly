const fs = require('fs');
const copyfiles = require('copyfiles');

copyfiles(['widget_sdk/widget.**', 'dist'], { all: false }, (err) => {
  if (err) {
    console.warn('copy widget temp file err', err);
  } else {
    console.log('copy widget temp file success');
  }
  // 移除临时文件
  fs.rm('widget_sdk', { recursive: true }, (err) => {
    if (err) {
      console.warn('remove widget sdk err', err);
    } else {
      console.log('remove widget sdk success');
    }
  });
});
