// JSON 파일의 value 값을 unicode로 바꾸는 유틸리티입니다.
// 이미 unicode인 value의 경우 변환하지 않습니다.
// 파일명 입력시 해당 파일을 바꿉니다.
// 폴더명 입력시 해당 폴더에 있는 모든 JSON 파일을 바꿉니다.(하위 폴더까지 검사하진 않음)

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 유니코드 여부 확인
function isUnicode(str) {
  return /^\\u[0-9a-fA-F]{4}$/.test(str);
}

function convertToUnicode(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      obj[key] = convertToUnicode(obj[key]);
    } else if (typeof obj[key] === 'string') {
      obj[key] = obj[key].split('').map(char => {
        const unicode = char.charCodeAt(0).toString(16);
        return `\\u${'0'.repeat(4 - unicode.length)}${unicode}`;
      }).join('');

    }
  }
  return obj;
}


rl.question(`==========================================
JSON 파일의 한글 value 값을 unicode로 바꾸는 유틸리티입니다.
이미 unicode인 value의 경우 변환하지 않습니다.
파일명 입력시 해당 파일을 바꿉니다.
폴더명 입력시 해당 폴더에 있는 모든 JSON 파일을 바꿉니다.(하위 폴더까지 검사하진 않음)
==========================================
경로를 입력해주세요: `, (inputPath) => {
  const absolutePath = path.resolve(inputPath);

  if (fs.existsSync(absolutePath)) {
    if (fs.statSync(absolutePath).isFile() && path.extname(absolutePath) === '.json') {
      processFile(absolutePath);
    } else if (fs.statSync(absolutePath).isDirectory()) {
      processFolder(absolutePath);
    } else {
      console.log('잘못된 입력입니다.');
      rl.close();
    }
  } else {
    console.log('존재하지 않는 폴더/파일입니다.');
    rl.close();
  }
});

function processFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    const convertedData = convertToUnicode(jsonData);
    const jsonString = JSON.stringify(convertedData, null, 2).replace(/\\\\/g, "\\");

    fs.writeFileSync(filePath, jsonString, 'utf-8');
    console.log(`변환 성공! ${filePath} 파일이 변경되었습니다..`);
  } catch (error) {
    console.error('JSON 파일을 읽거나 변환하는 데 문제가 발생헀습니다. :', error.message);
  } finally {
    rl.close();
  }
}

function processFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.json') {
        processFile(filePath);
      }
    });

    console.log(`변환 성공! ${folderPath} 폴더의 모든 파일이 변경되었습니다.`);
  } catch (error) {
    console.error('파일을 읽어오는 데 문제가 발생했습니다.', error.message);
  } finally {
    rl.close();
  }
}