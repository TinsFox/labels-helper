const axios = require('axios');
const { readFileSync } = require('fs');

const { dealStringToArr, getReandomColor } = require('./util.js');
const { createLabel } = require('./octokit');

async function run() {
  try {
    const json = JSON.parse(readFileSync('./create.json'));

    const getOwner = json['get-owner'];
    const getRepo = json['get-repo'];
    const targetOwner = json['target-owner'];
    const targetRepo = json['target-repo'];
    const path = json['path'];
    const ignore = json['ignore'];
    const format = json['format'];
    const desc = json['desc'];
    const color = json['color'];

    const URL = `https://api.github.com/repos/${getOwner}/${getRepo}/contents/${path}`;
    const res = await axios.get(URL);
    console.log('res', res);
    const names = res.data;
    for (let i = 0; i < names.length; i++) {
      let name = names[i].name;
      if (name.startsWith('_') || dealStringToArr(ignore).includes(name)) {
        console.log(`[${name}] is ignore!`);
        continue;
      }
      await createLabel(
        targetOwner,
        targetRepo,
        getFormat(name, format),
        getReandomColor(color),
        getFormat(name, desc),
      );
    }
  } catch (error) {
    console.log(error.message);
  }
}

function getFormat(name, format) {
  if (!format) {
    return name;
  }
  let str = '';
  const arr = (name.includes('-') && name.split('-')) || (name.includes('_') && name.split('_'));
  if (arr.length > 1) {
    str = `${firstUpperCase(arr[0])}${firstUpperCase(arr[1])}`;
  } else {
    str = firstUpperCase(name);
  }
  return format.replace(/\$name/g, str);
}

function firstUpperCase(str) {
  return str.toLowerCase().replace(/^\S/g, function (s) {
    return s.toUpperCase();
  });
}

run();
