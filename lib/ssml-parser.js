


var xmlNode = {
  name: '',
  attributes: '',
  children: []
};

var xmlAttribute = {
  name: '',
  value: ''
};

function parsessml(xmlStr) {
  

  var result = {
    declaration: {},
    children: []
  }

}

window.parsessml = parsessml;


window.stripSsml = stripSsml;

function stripSsml(ssmlStr) {
  var result = [];
  
  var indexOfLt = ssmlStr.indexOf('<');

  if (indexOfLt === -1) return result;

  var indexOfGt = 0;

  while(indexOfLt > -1) {

    subResult = ssmlStr.substring(indexOfGt, indexOfLt);
    result.push(subResult);

    indexOfGt = ssmlStr.indexOf('>', indexOfLt);

    if (indexOfGt === -1) break;
    indexOfGt += 1;
    
    indexOfLt = ssmlStr.indexOf('<', indexOfGt);
  }

  if (indexOfGt < ssmlStr.length) {
    var lastPart = ssmlStr.substring(indexOfGt);
    result.push(lastPart);
  }

  result = result.join(" ");
  return result;
}




